---
name: aws-infrastructure-map
description: >
  The durable cross-layer map of how GitHub Actions, Makefile-managed IAM,
  and Terraform-managed IAM fit together in cloud/terraform/aws. Covers the
  dual IAM provisioning system, the 6-provider-alias broker chain, the
  Makefile bootstrap order, and the known failure taxonomy. All infra agents
  and skills MUST read this file alongside monorepo-paths.md before
  diagnosing or touching anything IAM/OIDC-related.
metadata:
  author: app-dev-exp
  version: "1.0"
---

# AWS Infrastructure Map — ADE Monorepo

This file exists because no single agent or skill in `agents/infrastructure/`
owns a standing answer to "how do GitHub Actions, Makefile-owned IAM, and
Terraform fit together, and what's the current known-good baseline."

---

## 1. Two independent IAM provisioning systems

`cloud/terraform/aws` provisions IAM roles through **two systems that do not
know about each other**:

| | Makefile / AWS CLI (`makefiles/aws-roles.mk` + `iam/*.json.tpl`) | Terraform-native (`module/iam/main.tf`) |
|---|---|---|
| Execution role name | `appdevexp-task-execution-role` | `${application_name}-task-execution-role` |
| Task role name | `appdevexp-$(APP_NAME)-task-role` | `${application_name}-app-task-role` |
| Extra role | — | `${application_name}-ecs-role-manager` (service-scaling only) |
| Policy scope | Broader: Secrets Manager, SSM, S3, observability | Narrower: Secrets Manager + KMS + EFS only |
| Created by | `aws iam create-role` / `put-role-policy` CLI calls, run manually by an admin | `aws_iam_role` / `aws_iam_role_policy` resources, applied by CI |
| Invoked from CI? | **No** — no `.github/workflows/*.yml` calls any `makefiles/*.mk` target | Yes — every `terraform apply` in `deploy_cm_infrastructure.yml` |

**Which one is live:** `module/iam` (Terraform-native). Confirm in `main.tf:88-99` —
`module.ecs_app` (`main.tf:137-172`) wires `task_execution_role_arn` and
`app_task_role_arn` straight from `module.iam` outputs
(`module/iam/outputs.tf`). The Makefile-created `appdevexp-*` roles are not
referenced by any running ECS task definition. **Editing `iam/*.json.tpl` and
re-running the Makefile has zero effect on production permissions.**

Why both exist: the Makefile system bootstraps the identities Terraform itself
needs to run (the deployer role and its five service-role targets, §2) —
Terraform cannot create the credentials it authenticates with. `module/iam`
is the actual application-runtime IAM, created by Terraform once it's already
running with borrowed permissions. This is intentional, but the naming
collision (both use `-task-execution-role` / `-task-role` suffixes with
different prefixes) makes it easy to diagnose the wrong one.

**Standing check for every audit:** before treating any IAM finding as
resolved, confirm which system it's in. Use `aws ecs describe-task-definition`
to read the live `executionRoleArn`/`taskRoleArn` and match the name pattern
against the table above — `iam-template-validator` Step 2 already does this;
apply the same check when reasoning about *any* other role in this repo.

---

## 2. The credential-broker chain (OIDC → deployer → 5 service roles)

GitHub Actions never assumes a role that has direct permissions. It assumes
one thin role, which in turn assumes narrower roles per Terraform provider
alias:

```
GitHub OIDC (token.actions.githubusercontent.com)
  → sts:AssumeRoleWithWebIdentity
  → appdevexp-deployer                         (terraform-trust-policy.json.tpl)
        permissions: terraform-backend, ecr-push ONLY
        │
        ├─ aws.ecs  provider alias  → sts:AssumeRole → appdevexp-ecs-deploy-role
        ├─ aws.kms  provider alias  → sts:AssumeRole → appdevexp-kms-manage-role
        ├─ aws.logs provider alias  → sts:AssumeRole → appdevexp-logs-role
        ├─ aws.waf  provider alias  → sts:AssumeRole → appdevexp-waf-role
        └─ aws.s3   provider alias  → sts:AssumeRole → appdevexp-s3-manage-role
```

Source of truth for the alias → role mapping: `versions.tf:13-71` (six
`provider "aws"` blocks — the unaliased default plus five aliases, each with
its own `assume_role.role_arn`). Which module uses which alias:
`module.kms`→`aws.kms`, `module.logging`→`aws.logs`+`aws.s3`,
`module.network`/`module.cluster`/`module.iam`/`module.efs`/`module.ecs_app`
→`aws.ecs`, `module.security`→`aws.waf`+`aws.logs` (see `main.tf`).

**This is a deliberate broker pattern, not a misconfiguration.** `appdevexp-deployer`
is intentionally kept thin (only 2 inline policies: `terraform-backend`,
`ecr-push` — `makefiles/aws-roles.mk:144-158`) so a compromised or
misconfigured CI credential can't do anything by itself; it must chain
through a second, narrower `sts:AssumeRole` for every other service.

**The trust condition is deliberately repo-wide, not branch-scoped.**
`iam/terraform-trust-policy.json.tpl:12` scopes the OIDC `sub` condition to
`repo:__GITHUB_USER__/__REPO_NAME__:*` — no `ref:refs/heads/...`, no
`environment:...`. This is true even though `deploy_cm_infrastructure.yml`
declares `environment: DEV`. **Do not flag this as a bug** — it is the
accepted trust boundary for this repo (any workflow run in this repo, any
branch, can assume the deployer). If tightening this is ever proposed, it's a
deliberate policy change requiring human sign-off, not a "fix."

**Symptom of a broken link in this chain:** `terraform plan`/`apply` fails
with `AccessDenied` / `is not authorized to perform: sts:AssumeRole` on a
specific provider alias, or downstream with `implicitDeny` on a resource
action. Terraform's own error only names the missing action — it never tells
you "IAM is the problem" or which of the 5 service roles is misconfigured.
Diagnosis must start from *which provider alias* the failing resource
address uses (see mapping above), then check that alias's `assume_role.role_arn`
target with `aws iam get-role` / `list-role-policies`.

---

## 3. Makefile bootstrap order (manual, admin-only, never run from CI)

None of `aws-backend.mk`, `aws-roles.mk`, `aws-ecr.mk`, `aws-secrets.mk` are
invoked by any `.github/workflows/*.yml`. CI only ever runs
`terraform init/validate/plan/apply` against `module/` (see
`deploy_cm_infrastructure.yml`). The entire IAM/OIDC bootstrap layer is
invisible to CI and to any agent that reads only workflow files or `.tf` diffs.

Required one-time run order (`aws-roles.mk:129-131,256-257`):

```
bootstrap-boundary        # appdevexp-permissions-boundary policy — must exist first,
                           # every other role attaches it as a permission ceiling
  → bootstrap-deployer          # appdevexp-deployer + terraform-backend/ecr-push policies
    → bootstrap-service-roles   # 5 service roles (ecs-deploy, kms-manage, waf, logs, s3-manage)
      → bootstrap-runtime-roles # appdevexp-task-execution-role, appdevexp-$(APP_NAME)-task-role
                                 # (Makefile-side only — NOT what's actually live, see §1)
```

After editing any `iam/*.json.tpl`, the matching `update-<role>` target
(`aws-roles.mk:262-338`) must be re-run manually — there is no CI hook and no
drift detection outside `infra-planner`'s `iam-template-validator` skill.

`make destroy-all` / `destroy-*` targets exist and are destructive
(`aws-roles.mk:374-439`) — never run without explicit human confirmation, and
note they only affect the Makefile-side roles in §1, not the live
`module/iam` roles Terraform manages.

---

## 4. Known failure taxonomy

| # | Class | Symptom | Where to look |
|---|---|---|---|
| 1 | Missing action on `.tpl` after a new `.tf` resource | `terraform apply` fails with `AccessDenied` on a new resource type/action | Check the relevant `iam/*.json.tpl` was updated **and** the matching `update-<role>` Makefile target was re-run (§3) |
| 2 | CI secret pointing at an unmanaged/dangling role | `AWS_ROLE_ARN` resolves to a role with no owner (see `GitHubActionsTerraformRole`, §5) — looks identical to a healthy role from workflow YAML alone | Resolve the ARN's live identity with `aws iam get-role`; check whether it appears in any `.tpl` bootstrap target or any `aws_iam_role` resource in `module/`. If neither → it's a dangling reference (§5), not a workflow bug |
| 3 | Divergent Makefile-vs-Terraform role definitions | Editing Makefile-side `.json.tpl` has no effect on running ECS tasks | Confirm which system is live per §1 before treating any Makefile-side IAM edit as a fix |
| 4 | Terraform resource depending on a Makefile-created resource with no cross-tool `depends_on` | `terraform plan`/`apply` `implicitDeny` on a provider-alias assume-role, with no Terraform-visible cause | Trace the failing alias to its Makefile-created target role (§2) — Terraform cannot express this dependency, so it fails silently rather than refusing to plan |

---

## 5. Dangling reference — `GitHubActionsTerraformRole` (confirmed, not hypothetical)

`GitHubActionsTerraformRole` is referenced in exactly two places and created
by neither:

- `iam/service-trust-policy.json.tpl:14` — allowed (alongside `appdevexp-deployer`)
  to assume the KMS service role's trust policy.
- `module/kms/variables.tf:9-13` — the *default value* of `terraform_role_name`,
  consumed by `module/kms/main.tf:30` to build a KMS key-policy principal ARN.

No `.tpl` bootstrap target in `aws-roles.mk` and no `aws_iam_role` resource
anywhere in `module/` creates a role by this name. It is invisible from `.tf`
syntax (valid HCL) and invisible from workflow YAML (no workflow references
this name). Whether it's a stale reference safe to delete, or a role that
exists out-of-band in the live AWS account, is a one-call question:
`aws iam get-role --role-name GitHubActionsTerraformRole`. Resolve this before
relying on `module/kms`'s key policy being correct — do not assume either
answer without running the check.

---

## 6. Cross-references (do not copy verbatim)

- `cloud/terraform/aws/docs/ADMIN_SETUP.md` and `cloud/terraform/aws/README.md`
  describe the real OIDC/Terraform-native flow as of the last reconciliation
  pass (see commit history for `docs(cloud-aws)` scope). If they describe a
  static IAM-user/access-key model or `terraform workspace` commands again in
  the future, that's drift — treat this map file as authoritative over those
  docs for anything IAM/OIDC-related, and flag the docs for re-reconciliation
  rather than ingesting them directly into agent context.
- `agents/shared/context/development-guidance.md` — names the 4 Makefiles and
  bootstrap order at a summary level; this file has the full detail.

---

## Change protocol

Update this file whenever a new Terraform module, provider alias, or Makefile
bootstrap target is added under `cloud/terraform/aws/`. This is the one
ongoing-governance responsibility in the infra agent set.

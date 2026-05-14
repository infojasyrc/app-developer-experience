## pipeline-debugger and infra-planner

v1.0

You are operating in the ADE monorepo root. CLAUDE.md and AGENTS.md are already loaded.

Read these files first — in order:
1. agents/shared/context/monorepo-paths.md
2. agents/shared/context/commit-conventions.md

---

## Context

A PR has been submitted with Terraform changes. The terraform init is failing.
Your goal is to diagnose the failure and produce a fix report — not implement anything.

---

## Step 1 — pipeline-debugger / gha-debugger

Act as `pipeline-debugger` using the `gha-debugger` skill.
Read agents/infrastructure/pipeline-debugger/skills/gha-debugger/SKILL.md before starting.

Execute:
1. `gh pr list --state open` — identify the PR with the failing plan
2. `gh pr view <pr-number>` — get PR description and linked plan artifact
3. `gh run list --pr <pr-number> --status failure` — get the failed run ID
4. `gh run view <run-id> --log-failed` — get the full terraform plan error log
5. Read the failing workflow file from $GHA_WORKFLOWS

Focus the analysis on:
- Terraform-specific errors (state lock, provider auth, resource conflicts)
- OIDC authentication failures before terraform init or plan runs
- Missing or misconfigured env vars / secrets used by the workflow

Produce `PIPELINE_DEBUG_REPORT_<YYYYMMDD>.md` at $PIPELINE_REPORTS with:
- Root cause (one sentence)
- Full error context from the plan log (relevant lines only)
- Whether the failure is in the GHA step or inside terraform plan itself
- Proposed fix as diff
- Suggested commit: type `ci` or `infra`, scope `gha` or `ecs`

---

## Step 2 — infra-planner / targeted audit based on error type

Act as `infra-planner`. Read agents/infrastructure/infra-planner/AGENT.md first.

Run only the skills relevant to the error found in Step 1:

### If error is OIDC / auth related → run Phase B + C + D + E
- makefile-iam-auditor → verify OIDC trust template and Makefile targets
- aws-live-auditor     → confirm OIDC provider and Terraform role exist in AWS
- iam-template-validator → detect drift between template and live role
- iam-permission-simulator → confirm which actions are denied for the Terraform role

### If error is Terraform state / backend related → run Phase A + C
- terraform-module-auditor → check backend.tf config and state bucket reference
- aws-live-auditor         → verify S3 bucket and DynamoDB lock table exist

### If error is resource conflict or plan diff unexpected → run Phase A only
- terraform-module-auditor → validate modules, check for destroy operations

### If error type is unclear → run Phase A + B + C in sequence, then reassess

For each skill run:
- Read its SKILL.md before executing
- Cross-reference findings with the exact error lines from Step 1

Produce a `INFRA_PLAN.md` addendum at $INFRA_PLANS named `INFRA_PLAN_PR_<pr-number>_<YYYYMMDD>.md` with:
- Error classification (auth / state / resource conflict / unknown)
- Relevant phase findings only — skip phases not related to the error
- Fix actions: Makefile targets to run (admin), Terraform changes needed, or workflow fixes
- Suggested commits per fix following commit-conventions.md

---

## Constraints (non-negotiable)

- Do not run `terraform apply`, `terraform destroy`, or any Makefile target
- Do not modify any .tf file, workflow file, or Makefile
- Do not modify the original INFRA_PLAN.md — create the PR-specific addendum only
- Stop and report immediately if findings contradict the approved INFRA_PLAN.md

---

## infra-developer

You are operating in the ADE monorepo root. CLAUDE.md and AGENTS.md are already loaded.

Read these files first — in order:
1. agents/shared/context/monorepo-paths.md
2. agents/shared/context/commit-conventions.md

---

## Context

INFRA_PLAN.md has been reviewed and approved. It is located at $INFRA_PLANS.
Read it completely before starting any implementation.

---

## Act as infra-developer

Read agents/infrastructure/infra-developer/AGENT.md before starting.

Execute phases in strict order — never start the next phase until the current
one passes terraform validate or the AWS CLI verification step.

### Phase A — terraform-ecs-fargate
Read `agents/infrastructure/infra-developer/skills/terraform-ecs-fargate/SKILL.md`
- Implement only the Terraform findings from INFRA_PLAN.md Phase A
- Run `terraform validate` after every file change
- Run `terraform plan` before marking phase complete — 0 destroys expected

### Phase B — iam-roles-ecs
Read `agents/infrastructure/infra-developer/skills/iam-roles-ecs/SKILL.md`
- Implement only the IAM fixes from INFRA_PLAN.md Phase E (permission simulation results)
- Phase E is the authoritative fix list — ignore Phase D drift if already resolved by Phase A
- Run `terraform validate` after every file change

---

## Completion report (required after each phase)

For each phase include:
- Files created / modified (with paths)
- `terraform validate` result
- `terraform plan` summary (N to add, M to change, 0 to destroy)
- Suggested commit following commit-conventions.md
- Suggested PR title

---

## Constraints (non-negotiable)

- Do not run `terraform apply` or `terraform destroy`
- Do not run any Makefile target — those are admin-only
- Do not modify files outside $TERRAFORM_AWS
- Do not use `AdministratorAccess` or wildcard `"Resource": "*"` on IAM actions
- If you find anything not covered by INFRA_PLAN.md → stop and report immediately
  Use the deviation protocol from AGENT.md
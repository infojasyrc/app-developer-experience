# AWS Terraform Backend: Admin Setup Guide

> This document explains the one-time administrative setup required to provision the shared Terraform backend (S3 + DynamoDB), register GitHub as an OIDC identity provider, and bootstrap the IAM role chain GitHub Actions uses to run Terraform. It is based on the Makefile targets in this directory (`Makefile`, `makefiles/aws-backend.mk`, `makefiles/aws-roles.mk`).
>
> **This repo does not use static IAM users or access keys.** All Terraform runs — local and CI — authenticate via AWS IAM Roles Anywhere / GitHub OIDC and `sts:AssumeRole`, never long-lived `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` pairs. If you find a doc or script referencing `make create-user` or `make create-keys`, it predates this migration — those targets no longer exist.

## 0. Purpose

We use an S3 bucket for remote Terraform state storage and a DynamoDB table
for state locking to prevent concurrent mutations. GitHub Actions
authenticates to AWS via OpenID Connect (OIDC) — no stored AWS credentials
in GitHub secrets, only a role ARN it's allowed to assume. Admins perform
bootstrap once (backend infra, then the IAM role chain); thereafter CI and
developers only ever assume roles, never manage keys.

For the full picture of how the resulting roles chain together (thin
deployer role → five narrower service roles) and how this differs from the
IAM roles Terraform itself creates for the running application, see
`agents/shared/context/aws-infrastructure-map.md` — that file is the
authoritative cross-layer map; this doc only covers the one-time setup steps.

## 1. Prerequisites (Admin Workstation)

Ensure the following are installed and configured with admin‑level AWS
credentials (an IAM principal allowed to create IAM roles/policies, S3
buckets, DynamoDB tables, and register OIDC providers):

- AWS CLI v2 (`aws --version`)
- Terraform >= 1.13 (`terraform version`)
- Make (GNU Make)

Permissions required on the admin principal:
- `iam:CreateRole`, `iam:PutRolePolicy`, `iam:CreatePolicy`, `iam:CreateOpenIDConnectProvider`
- `s3:CreateBucket`, `s3:PutBucketVersioning`, `s3:PutBucketTagging`, `s3:PutPublicAccessBlock`
- `dynamodb:CreateTable`

## 2. Environment Configuration

The Makefile auto-loads either `.env` (private, gitignored) or falls back to
`.env.public` (see `cloud/terraform/aws/.env.public` for the full variable
list with placeholder values). Create a private `.env` file before running
admin tasks.

Variables used by the bootstrap targets in this guide:
- `AWS_REGION` — region for backend resources and all roles
- `AWS_ACCOUNT_ID` — your AWS account ID (used in role/policy ARN construction)
- `TF_STATE_BUCKET` — remote state bucket name (must be globally unique)
- `TF_LOCK_TABLE` — DynamoDB lock table name
- `ADMIN_USER_NAME` — the AWS CLI profile name used for admin-only targets (`whoami`, `list-resources`)
- `GITHUB_USER`, `REPO_NAME` — used to scope the OIDC trust policy's `sub` condition (see `iam/terraform-trust-policy.json.tpl`)
- `APP_NAME` — application name prefix used in the Makefile-side runtime role names

## 3. Backend Config File (`backend.conf`)

Create a local (gitignored) file named `backend.conf`, used by
`make init` (which runs `terraform init -backend-config=backend.conf`). Copy
`backend.conf.example` as a starting point:

```
bucket         = "<your-unique-bucket-name>"
key            = "terraform.tfstate"
region         = "<your-region>"
dynamodb_table = "<your-lock-table-name>"
```

`backend.conf` is already listed in `.gitignore`. GitHub Actions does not use
this file — `deploy_cm_infrastructure.yml` passes the equivalent
`-backend-config` flags directly from GitHub secrets/vars at `terraform init`
time.

## 4. One-Time Admin Bootstrap Sequence

Run the following from `cloud/terraform/aws/`, **in order** — each step
depends on the previous one:

```bash
# Step 1 — S3 state bucket, DynamoDB lock table, GitHub OIDC provider (as ADMIN)
make setup-backend

# Step 2 — permissions boundary, OIDC deployer role, 5 service roles, ECS
# runtime roles (as ADMIN). Full detail on what each of these four sub-steps
# creates and why: agents/shared/context/aws-infrastructure-map.md §2–3.
make bootstrap-all
```

`setup-backend` (defined in `makefiles/aws-backend.mk`) expands to
`create-bucket` → `create-lock-table` → `create-oidc-provider`.
`bootstrap-all` (defined in `makefiles/aws-roles.mk`) expands to
`bootstrap-boundary` → `bootstrap-deployer` → `bootstrap-service-roles` →
`bootstrap-runtime-roles`, in that fixed order — the deployer role's trust
policy and the service roles' assume-role targets depend on the boundary
policy existing first.

After both steps: add the deployer role's ARN
(`arn:aws:iam::<account>:role/appdevexp-deployer`) as the `AWS_ROLE_ARN`
secret in GitHub repository settings. CI authenticates with this ARN via
`aws-actions/configure-aws-credentials@v4` — no access keys are ever
generated or stored.

## 5. Hand-Off to Terraform Users / CI

Local Terraform runs and CI both authenticate the same way: assume a role,
never export static keys.

**CI (GitHub Actions):** already wired in `.github/workflows/deploy_cm_infrastructure.yml`
— `permissions: id-token: write` + `configure-aws-credentials@v4` with
`role-to-assume: ${{ secrets.AWS_ROLE_ARN }}`. Nothing further to configure
per-developer.

**Local admin/developer runs:** use your own named AWS CLI profile (SSO or
an assumed-role profile) — never a static access key pair for this project.
Then:

```bash
make init
make plan
make apply
# destroy (careful — irreversible, affects shared infrastructure):
make destroy
```

## 6. Help / Discoverability

```bash
make help
```

## 7. Security & Compliance Notes

- S3 bucket public access is blocked; versioning enabled for state recovery.
- DynamoDB provisioned throughput is minimal (1/1 read/write); adjust via
  `aws dynamodb update-table` if concurrency needs increase.
- The OIDC trust condition (`iam/terraform-trust-policy.json.tpl`) scopes
  `sub` to `repo:<org>/<repo>:*` — repo-wide, not branch-scoped. This is a
  deliberate design choice (see `aws-infrastructure-map.md` §2), not a gap —
  do not "fix" it without a deliberate, human-approved policy change.
- `appdevexp-deployer` only holds `terraform-backend` and `ecr-push` inline
  policies; it reaches everything else by assuming one of five narrower
  service roles per Terraform provider alias (`aws-infrastructure-map.md` §2).
- Rotate nothing here — there are no long-lived credentials to rotate. If a
  role's trust or permissions need tightening, edit the relevant
  `iam/*.json.tpl` and re-run the matching `make update-<role>` target.

## 8. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `AccessDenied` / `Could not load credentials` in CI | `AWS_ROLE_ARN` secret unset, or `permissions: id-token: write` missing from the workflow | Confirm the secret is set to `appdevexp-deployer`'s ARN; check the workflow's `permissions:` block |
| `AccessDenied` mid-`apply`, naming a specific resource/service | A provider-alias assume-role is broken (one of the 5 service roles) or its inline policy is missing an action | Resolve which provider alias the failing resource uses, then check that alias's target role — see `aws-infrastructure-map.md` §2 for the alias→role mapping |
| `NoSuchBucket` / `NoSuchEntity` (DynamoDB table) | Bucket/table name mismatch, or `setup-backend` was never run | Confirm names in `backend.conf` match `TF_STATE_BUCKET`/`TF_LOCK_TABLE`; re-run `make setup-backend` if the account doesn't have them yet |
| `ConditionalCheckFailedException` in DynamoDB | Concurrent Terraform applies | Let the previous apply finish; locking works as designed |
| A role name resolves but its policy/trust looks wrong and you can't find what created it | Possible dangling reference (confirmed example: `GitHubActionsTerraformRole` — see `aws-infrastructure-map.md` §5) | Run `aws iam get-role --role-name <name>` and check whether any `.tpl`/Makefile target or Terraform resource actually owns it before assuming it's correctly managed |

## 9. Cleanup (If Decommissioning Backend)

Order matters to avoid orphaned locks or dangling trust relationships:

1. Ensure no active Terraform operations.
2. `make destroy-all` (in `makefiles/aws-roles.mk`) — removes the deployer
   role, 5 service roles, ECS runtime roles, and the permissions boundary.
   **Destructive** — requires explicit confirmation, never run unattended.
3. Delete all objects (including versions) from the S3 state bucket.
4. `aws dynamodb delete-table --table-name <TF_LOCK_TABLE>`
5. `aws s3api delete-bucket --bucket <TF_STATE_BUCKET>`
6. Optionally deregister the GitHub OIDC provider if no other project in the
   account uses it: `aws iam delete-open-id-connect-provider --open-id-connect-provider-arn <arn>`.

> Always confirm with stakeholders and backups before destroying shared state infrastructure.

## 10. Quick Reference (Targets)

| Target | Where defined | Role | Description |
|--------|--------------|------|-------------|
| `setup-backend` | `aws-backend.mk` | Admin | S3 bucket + DynamoDB lock table + GitHub OIDC provider |
| `create-bucket` | `aws-backend.mk` | Admin | Creates & secures the S3 state bucket |
| `create-lock-table` | `aws-backend.mk` | Admin | Creates the DynamoDB lock table |
| `create-oidc-provider` | `aws-backend.mk` | Admin | Registers GitHub as an OIDC provider (once per account) |
| `bootstrap-all` | `aws-roles.mk` | Admin | Boundary → deployer → service roles → runtime roles, in order |
| `update-all-roles` | `aws-roles.mk` | Admin | Re-applies all inline policies after editing `.tpl` files |
| `verify-all` | `aws-roles.mk` | Admin | Reads back live IAM state for inspection |
| `whoami` | `aws-backend.mk` | Admin | Shows the AWS identity for the current admin profile |
| `list-resources` | `aws-backend.mk` | Admin | Lists AWS resources tagged `project=appdevexp` |
| `init` | root `Makefile` | TF User | Initializes Terraform against the remote backend |
| `plan` | root `Makefile` | TF User | Generates an execution plan |
| `apply` | root `Makefile` | TF User | Applies changes |
| `destroy` | root `Makefile` | TF User | Destroys all Terraform-managed infrastructure |
| `help` | root `Makefile` | Any | Lists available targets |

## 11. Verification Checklist (Post-Setup)

- [ ] S3 bucket exists with versioning and tags
- [ ] DynamoDB table exists with correct primary key (`LockID`)
- [ ] GitHub OIDC provider registered (`aws iam list-open-id-connect-providers`)
- [ ] `appdevexp-deployer` role exists with `terraform-backend` + `ecr-push` inline policies
- [ ] 5 service roles exist (`appdevexp-ecs-deploy-role`, `appdevexp-kms-manage-role`, `appdevexp-waf-role`, `appdevexp-logs-role`, `appdevexp-s3-manage-role`)
- [ ] `AWS_ROLE_ARN` GitHub secret set to `appdevexp-deployer`'s ARN
- [ ] `backend.conf` present locally (gitignored)
- [ ] `make init` succeeds with remote state configuration

## 12. FAQs

**Q: Can multiple teams share this backend?** Yes, but segregate state keys
(e.g., `teamA/app1/terraform.tfstate`) or use separate buckets for stricter
isolation.

**Q: We used to have `make create-user`/`make create-keys` — where did they go?**
Removed when this repo migrated to OIDC. There is no static-IAM-user path
anymore; see §0.

**Q: How do we enable encryption at rest?** S3 default SSE is recommended
(enforce via bucket policy). DynamoDB encryption is enabled automatically.

**Q: How do I update a role's permissions after editing a `.tpl` file?**
Run the matching `make update-<role>` target in `makefiles/aws-roles.mk`
(e.g. `make update-kms-role` after editing `iam/kms-manage-policy.json.tpl`).
There is no CI automation for this — it's a manual, admin-run step.

# Pipeline Debug Report

**Agent:** pipeline-debugger  
**Date:** 2026-04-26  
**Live run data:** confirmed via `gh run list` + `gh run view` + `gh secret list`

---

## Root Cause

The most recent deploy (`run 24938618406`, 2026-04-25) fails at `terraform apply` because the CI IAM role lacks `wafv2:PutLoggingConfiguration` permission **and** the CloudWatch Log Group `/aws/vpc/flowlogs/appdevexp-dev` already exists in AWS outside of Terraform state — both errors cause a non-zero exit and abort the apply.

---

## Failed Runs (last 5)

| Date | Run ID | Workflow | Branch | Trigger |
|---|---|---|---|---|
| 2026-04-25 | `24938618406` | Deploy Conference Manager Infrastructure | main | workflow_dispatch |
| 2026-04-21 | `24697315964` | Validate Conventional Commits | nx-cloud-setup | pull_request |
| 2026-04-21 | `24697314996` | Validate Conventional Commits | nx-cloud-setup | push |
| 2026-03-22 | `23395730288` | Deploy Conference Manager Infrastructure | main | push |
| 2026-03-19 | `23279734208` | Deploy Conference Manager Infrastructure | main | push |

The three most recent **Deploy Conference Manager Infrastructure** failures all share the same apply-phase errors (state drift + IAM permissions). The two **Validate Conventional Commits** failures are unrelated — they concern a branch convention on `nx-cloud-setup`, not the infrastructure pipeline.

---

## Evidence — Run 24938618406 Log (2026-04-25)

### Steps that PASSED

All pre-apply steps succeeded:
- Checkout Code ✅
- Configure AWS credentials ✅
- Setup Terraform ✅
- Terraform Format ✅
- Terraform Init ✅
- Terraform Validate ✅
- tfsec ✅
- Terraform Plan ✅

### Steps that FAILED

**Step: Terraform Apply** (`run set -o pipefail`)

```
Error: creating CloudWatch Logs Log Group (/aws/vpc/flowlogs/appdevexp-dev):
  operation error CloudWatch Logs: CreateLogGroup,
  StatusCode: 400, ResourceAlreadyExistsException:
  The specified log group already exists
```

```
Error: putting WAFv2 WebACL Logging Configuration
  (arn:aws:wafv2:us-west-1:580976914278:regional/webacl/appdevexp-dev-alb-waf/...):
  operation error WAFV2: PutLoggingConfiguration,
  StatusCode: 400, AccessDeniedException:
  You don't have the permissions that are required to perform this operation.
```

```
##[error]Terraform exited with code 1.
```

---

## Proposed Fixes

### Fix 1 — CRITICAL: Import the existing CloudWatch Log Group into Terraform state

The log group `/aws/vpc/flowlogs/appdevexp-dev` was created by a prior partial apply and is orphaned from state. Terraform tries to create it again on every run and fails.

**Resolution:** Import the existing resource so Terraform knows it already exists.

```bash
# Run locally with AWS credentials configured, from cloud/terraform/aws/
terraform import module.logging.<resource_address> /aws/vpc/flowlogs/appdevexp-dev
```

> Determine the exact resource address by running `terraform state list | grep logging` after a successful `terraform init`. Likely: `module.logging.aws_cloudwatch_log_group.vpc_flow_logs` or similar.

Once imported, `terraform plan` should show no changes for that resource and apply will proceed past it.

---

### Fix 2 — CRITICAL: Add `wafv2:PutLoggingConfiguration` to the CI IAM role

The role assumed by the pipeline (`AWS_ROLE_ARN`) does not have permission to attach a logging configuration to the WAFv2 Web ACL. This must be added to the role's inline or attached policy in AWS IAM.

**Required permission to add:**

```json
{
  "Effect": "Allow",
  "Action": [
    "wafv2:PutLoggingConfiguration",
    "wafv2:GetLoggingConfiguration",
    "wafv2:DeleteLoggingConfiguration"
  ],
  "Resource": "arn:aws:wafv2:us-west-1:580976914278:regional/webacl/*"
}
```

This can also be managed as Terraform in a `module/cicd-iam/` module (see `INFRA_PLAN.md` Phase B).

---

### Fix 3 — MEDIUM: Wrong path in NestJS lint step (static analysis finding)

**File:** `.github/workflows/pull_request_backend.yml`, line 68

This is not blocking infrastructure deploys but will fail NestJS PR checks.

```diff
     - name: Run Linting
       run: |
-        cd backend/project
+        cd backend/ms-nestjs-rest-tpl
         npm run lint
```

---

### Fix 4 — MEDIUM: Region drift — PR plan uses wrong region

**File:** `.github/workflows/pull_request_cm_infrastructure.yml`

The PR verification workflow omits `TF_VAR_aws_account_region`, so Terraform uses the `us-east-1` default during plan while `terraform apply` uses `us-west-1`.

```diff
     - name: Terraform Plan
       id: plan
       run: terraform plan -input=false
       env:
         TF_VAR_aws_account_id: ${{ vars.AWS_ACCOUNT_ID }}
+        TF_VAR_aws_account_region: ${{ env.AWS_REGION }}
         TF_VAR_db_name: ${{ vars.DB_NAME }}
         TF_VAR_db_username: ${{ secrets.DB_USERNAME }}
         TF_VAR_db_password: ${{ secrets.DB_PASSWORD }}
```

---

## Secrets / Variables Audit (Live)

### Secrets (`gh secret list`)

| Secret | Configured | Required by |
|---|---|---|
| `AWS_ROLE_ARN` | ✅ 2026-02-09 | deploy_cm_infrastructure, pull_request_cm_infrastructure, ci_cm_components |
| `BACKEND_AWS_S3_BUCKET` | ✅ 2026-01-25 | deploy_cm_infrastructure, pull_request_cm_infrastructure |
| `GH_PAT` | ✅ 2025-07-08 | release.yml |
| `AWS_ACCOUNT_ID` | ⚠️ stored as **secret**, referenced as `vars.AWS_ACCOUNT_ID` | deploy_cm_infrastructure, pull_request_cm_infrastructure |
| `BACKEND_AWS_S3_KEY` | ❌ MISSING | deploy_cm_infrastructure, pull_request_cm_infrastructure |
| `DB_USERNAME` | ❌ MISSING | deploy_cm_infrastructure, pull_request_cm_infrastructure |
| `DB_PASSWORD` | ❌ MISSING | deploy_cm_infrastructure, pull_request_cm_infrastructure |

### Variables (`gh variable list`)

| Variable | Value | Required by |
|---|---|---|
| `ENABLE_API_DEPLOY` | `false` | ci_cm_components |
| `ENABLE_WEBAPP_DEPLOY` | `false` | ci_cm_components |
| `BACKEND_AWS_DYNAMODB_TABLE` | `ade-terraform-lock-table` | deploy_cm_infrastructure, pull_request_cm_infrastructure |
| `DB_NAME` | `appdevexp` | pull_request_cm_infrastructure |
| `AWS_ACCOUNT_ID` | ❌ MISSING as variable | deploy_cm_infrastructure, pull_request_cm_infrastructure |

### Critical namespace mismatch

`AWS_ACCOUNT_ID` is stored as a **secret** but the workflows reference it as `${{ vars.AWS_ACCOUNT_ID }}`. In GitHub Actions, `secrets.*` and `vars.*` are separate namespaces — `vars.AWS_ACCOUNT_ID` resolves to empty string `""`. This does not cause current failures (the active modules don't use `var.aws_account_id`) but will break `TF_VAR_aws_account_id` once the IAM or application modules are enabled.

**Resolution:** Either move `AWS_ACCOUNT_ID` from Secrets to Variables in GitHub Settings, or update the workflow references to `${{ secrets.AWS_ACCOUNT_ID }}`.

---

## Informational

### Node.js 20 deprecation warning

```
##[warning] Node.js 20 actions are deprecated...
Actions will be forced to run with Node.js 24 by default starting June 2nd, 2026.
```

Affected actions: `actions/checkout@v4`, `actions/upload-artifact@v4`, `aws-actions/configure-aws-credentials@v4`, `hashicorp/setup-terraform@v3.0.0`. Not a current failure, but must be updated before June 2, 2026.

### Consistent action name typo (not a bug)

`.github/actions/container-regisry-push-and-metadata` — the action directory name matches the `uses:` reference exactly, so there is no runtime failure. It can be renamed for clarity but is not causing any issues.

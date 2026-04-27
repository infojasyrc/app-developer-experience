# Infrastructure Plan

**Agent:** infra-planner  
**Date:** 2026-04-26  
**Scope:** Audit of `cloud/terraform/aws/` cross-referenced with pipeline IAM errors from live run `24938618406`  
**Constraint:** No `terraform apply` executed. No source files modified.

---

## Phase A — Current State Findings

### A1. Module Inventory

| Module | Path | Active in `main.tf` | Notes |
|---|---|---|---|
| `kms` | `module/kms/` | ✅ Active | KMS key for CloudWatch encryption |
| `logging` | `module/logging/` | ✅ Active | CloudWatch log groups; depends on KMS |
| `network` | `module/network/` | ✅ Active | VPC, subnets, AZs, VPC flow logs |
| `cluster` | `module/cluster/` | ✅ Active | ECS Fargate cluster shell |
| `security` | `module/security/` | ✅ Active | WAFv2 ACL + CloudWatch log resource policy |
| `database` | `module/database/` | ❌ Commented out | RDS; `enable_database = false` |
| `iam` | `module/iam/` | ❌ Commented out | ECS task execution role; `enable_iam = false` |
| `application` | `module/application/` | ❌ Commented out | ALB, ECS service/task, DNS; `enable_application = false` |
| `auto_scaling` | `module/auto-scaling/` | ❌ Commented out | ECS scaling policies; `enable_auto_scaling = false` |

**Interpretation:** The deployment provisions foundational infrastructure only. No workload (ECS tasks, database, load balancer) is running yet.

---

### A2. IAM Errors Cross-Referenced from Pipeline (run 24938618406)

Two IAM/permissions errors caused the most recent apply failure:

#### A2a. `ResourceAlreadyExistsException` — CloudWatch Log Group

```
Error: creating CloudWatch Logs Log Group (/aws/vpc/flowlogs/appdevexp-dev)
  ResourceAlreadyExistsException: The specified log group already exists
```

**Cause:** The `module/logging` resource for the VPC flow log group was already created by a prior partial apply. The resource exists in AWS but is not in the Terraform state file, so Terraform attempts to create it on every run and fails.

**Affected module:** `module/logging` — `aws_cloudwatch_log_group` for VPC flow logs.

**Fix:** Import the existing log group into state (see Phase B, Fix 1).

---

#### A2b. `AccessDeniedException` — `wafv2:PutLoggingConfiguration`

```
Error: putting WAFv2 WebACL Logging Configuration
  (arn:aws:wafv2:us-west-1:580976914278:regional/webacl/appdevexp-dev-alb-waf/...)
  AccessDeniedException: You don't have the permissions that are required.
```

**Cause:** The CI IAM role (referenced by `secrets.AWS_ROLE_ARN`) does not have `wafv2:PutLoggingConfiguration` in its policy. The `module/security` creates a WAFv2 Web ACL and then attaches a logging configuration pointing to CloudWatch — that second call requires this permission.

**Affected resource:** `aws_wafv2_web_acl_logging_configuration.alb` in `module/security/main.tf`.

**Fix:** Add `wafv2:PutLoggingConfiguration` (and complementary read/delete actions) to the CI role's IAM policy (see Phase B, Fix 2).

---

### A3. IAM Module Analysis (inactive)

The `module/iam/main.tf` defines:

| Resource | Type | Purpose |
|---|---|---|
| `ecs_service_role` | `aws_iam_role` | ECS task execution role — assumes `ecs-tasks.amazonaws.com` |
| `ecs_service_role_policy_attach` | `aws_iam_role_policy_attachment` | Attaches AWS-managed `AmazonECSTaskExecutionRolePolicy` |
| `ecs_service_scaling` | `aws_iam_policy` | Custom scaling policy |
| `ecs_service_scaling` (attachment) | `aws_iam_role_policy_attachment` | Attaches scaling policy to ECS role |

**Critical activation dependency:** `main.tf` line 109:

```hcl
ecs_task_execution_role = var.enable_iam ? module.iam[0].ecs_service_role.arn : ""
```

If `enable_application = true` is set before `enable_iam = true`, `ecs_task_execution_role` is `""` and ECS task definition creation fails. Correct activation order is documented in Phase B.

---

### A4. Security Observations

| Finding | Severity | Location |
|---|---|---|
| `application-autoscaling:*` wildcard in IAM scaling policy | Medium | `module/iam/main.tf:37` |
| ALB and ECS task egress restricted to `10.0.0.0/16` only | ✅ Good | `module/application/main.tf` |
| `enable_deletion_protection = true` on ALB | ✅ Good | `module/application/main.tf` |
| KMS encryption for CloudWatch log groups | ✅ Good | `module/kms/`, `module/logging/` |
| WAFv2 ACL with AWS-managed rule sets (CommonRuleSet + KnownBadInputs) | ✅ Good | `module/security/main.tf` |
| `terraform.tfvars` committed with empty values — no secrets exposed | ✅ Safe | `cloud/terraform/aws/terraform.tfvars` |
| CI `AWS_ACCOUNT_ID` stored as secret but referenced as `vars.AWS_ACCOUNT_ID` | High | `.github/workflows/` |

---

### A5. Terraform Version

- `versions.tf`: `required_version = ">= 1.13.0"`, AWS provider `~> 6.0`
- Both CI workflows pin `terraform_version: 1.14.5` via `hashicorp/setup-terraform@v3.0.0`
- Verify 1.14.5 is a published release; if not, `setup-terraform` fails before any Terraform command runs

---

## Phase B — Recommendations

### Fix 1 — CRITICAL: Import orphaned CloudWatch Log Group into Terraform state

**Priority: Blocks every deploy run**

```bash
# From cloud/terraform/aws/, with AWS credentials configured:

# Step 1 — identify the exact resource address
terraform init ...  # standard backend config
terraform state list | grep logging

# Step 2 — import (replace <address> with actual output from step 1)
terraform import <address> /aws/vpc/flowlogs/appdevexp-dev

# Step 3 — verify no diff
terraform plan  # should show 0 to add, 0 to destroy for that resource
```

---

### Fix 2 — CRITICAL: Add WAFv2 permissions to CI IAM role

**Priority: Blocks every deploy run (alongside Fix 1)**

Add the following to the policy attached to the role referenced by `secrets.AWS_ROLE_ARN`:

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

**Long-term:** Add a `module/cicd-iam/` Terraform module that codifies the full OIDC trust policy and CI role permissions so this is managed as IaC and auditable.

---

### Fix 3 — HIGH: Resolve `AWS_ACCOUNT_ID` secret/variable namespace mismatch

**Priority: Blocks IAM + application module activation**

`AWS_ACCOUNT_ID` is stored as a GitHub **secret** but all workflows reference it as `${{ vars.AWS_ACCOUNT_ID }}`. The two namespaces are separate — `vars.AWS_ACCOUNT_ID` resolves to empty string.

**Option A (preferred):** Move `AWS_ACCOUNT_ID` from Secrets to Variables in GitHub Settings → Environments → DEV.

**Option B:** Update both workflow files to reference `${{ secrets.AWS_ACCOUNT_ID }}`:
```diff
-  TF_VAR_aws_account_id: ${{ vars.AWS_ACCOUNT_ID }}
+  TF_VAR_aws_account_id: ${{ secrets.AWS_ACCOUNT_ID }}
```

---

### Fix 4 — HIGH: Add missing secrets

The following secrets are referenced in workflows but absent from `gh secret list`:

| Secret | Workflow | Impact if missing |
|---|---|---|
| `BACKEND_AWS_S3_KEY` | deploy_cm_infrastructure, pull_request_cm_infrastructure | `terraform init -backend-config="key="` — may cause init to fail or use wrong state path |
| `DB_USERNAME` | deploy_cm_infrastructure, pull_request_cm_infrastructure | `TF_VAR_db_username = ""` — benign now (DB module off), blocks DB module activation |
| `DB_PASSWORD` | deploy_cm_infrastructure, pull_request_cm_infrastructure | `TF_VAR_db_password = ""` — same as above |

---

### Fix 5 — MEDIUM: Correct module activation order

**Priority: Required before enabling any workload modules**

Enable feature flags in this sequence to avoid dependency errors:

```
Step 1: enable_iam = true         → terraform apply → verify role ARN in AWS console
Step 2: enable_database = true    → terraform apply → verify RDS endpoint
Step 3: enable_application = true → terraform apply → verify ALB + ECS service
Step 4: enable_auto_scaling = true → terraform apply
```

Also: set non-empty values in `terraform.tfvars` (or supply via CI secrets/vars) before enabling each module:
- `ecr_frontend`, `ecr_backend` — required by `application` module
- `api_entrypoint_folder`, `migration_entrypoint_folder` — required by ECS task template

---

### Fix 6 — MEDIUM: Narrow `application-autoscaling:*` to least-privilege

**Priority: Security hygiene, apply before enabling auto-scaling**

```diff
 actions = [
-  "application-autoscaling:*",
+  "application-autoscaling:RegisterScalableTarget",
+  "application-autoscaling:DeregisterScalableTarget",
+  "application-autoscaling:PutScalingPolicy",
+  "application-autoscaling:DeleteScalingPolicy",
+  "application-autoscaling:DescribeScalingPolicies",
+  "application-autoscaling:DescribeScalableTargets",
   "ecs:DescribeServices",
   ...
 ]
```

---

### Fix 7 — LOW: Update Node.js 20 actions before June 2, 2026

The following action versions must be updated to Node.js 24-compatible releases before GitHub forces the runtime change:

| Action | Used in |
|---|---|
| `actions/checkout@v4` | All workflows |
| `actions/upload-artifact@v4` | deploy_cm_infrastructure |
| `aws-actions/configure-aws-credentials@v4` | deploy_cm_infrastructure, pull_request_cm_infrastructure, ci_cm_components |
| `hashicorp/setup-terraform@v3.0.0` | deploy_cm_infrastructure, pull_request_cm_infrastructure |

---

## Out of Scope — Not Performed

- `terraform apply` — not executed
- `terraform plan` — not executed (requires AWS credentials)
- Modification of any `.tf` source files
- Modification of any `.github/workflows/` files (diffs are in `PIPELINE_DEBUG_REPORT.md`)

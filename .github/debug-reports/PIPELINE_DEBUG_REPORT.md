# Pipeline Debug Report

Date: 2026-05-05
Workflow: `.github/workflows/deploy_cm_infrastructure.yml`
Run ID: 24938618406
Branch: main

---

## Root Cause

The `appdevexp-deployer` OIDC role has no direct AWS service permissions — it can only manage Terraform state (S3/DynamoDB) and assume sub-roles — but the Terraform AWS provider in `versions.tf` has no `assume_role` configuration, so Terraform operates with the deployer's minimal credentials and receives `implicitDeny` for every resource operation.

---

## Evidence

```
# From run 24938618406 — Terraform Apply step

2026-04-25T19:21:13.6741690Z Error: creating CloudWatch Logs Log Group
  (/aws/vpc/flowlogs/appdevexp-dev): ResourceAlreadyExistsException:
  The specified log group already exists

2026-04-25T19:21:13.6747312Z Error: putting WAFv2 WebACL Logging Configuration
  (arn:aws:wafv2:us-west-1:580976914278:regional/webacl/appdevexp-dev-alb-waf/...):
  AccessDeniedException: You don't have the permissions that are required
  to perform this operation.

2026-04-25T19:21:13.6767559Z ##[error]Terraform exited with code 1.

# IAM simulation confirms — deployer role:
  wafv2:PutLoggingConfiguration  → implicitDeny
  logs:CreateLogGroup            → implicitDeny
  ec2:CreateVpc                  → implicitDeny
  ecs:CreateCluster              → implicitDeny
  kms:CreateKey                  → implicitDeny
  s3:CreateBucket                → implicitDeny

# Only allowed:
  s3:GetObject / PutObject / ListBucket (TF state bucket only)
  dynamodb:GetItem / PutItem / DeleteItem (lock table only)
  sts:AssumeRole (sub-roles only — never triggered by Terraform)
```

---

## Contributing Factors

1. **Architecture never wired to Terraform** — The role-chaining design (deployer → waf-role, ecs-deploy-role, etc.) was built but the Terraform AWS provider was never given `assume_role` blocks to use those sub-roles. All six sub-roles exist and have correct policies, but Terraform never calls `sts:AssumeRole` to use them.

2. **CloudWatch log group out-of-state** — `/aws/vpc/flowlogs/appdevexp-dev` was created during a partial March 2026 apply (confirmed: exists in AWS, creation timestamp ~March 2026) but `create_before_destroy = true` on the resource triggers a replace cycle that tries to create before destroying, hitting the `ResourceAlreadyExistsException`.

3. **`AWS_ACCOUNT_ID` secret/variable mismatch** — `AWS_ACCOUNT_ID` is stored as a repository **secret** (`gh secret list` confirms) but the workflow reads it as `vars.AWS_ACCOUNT_ID` (a repository variable). The two namespaces are distinct in GitHub Actions; when `vars.AWS_ACCOUNT_ID` is unset, the TF_VAR resolves to an empty string.

4. **Missing secrets** — `BACKEND_AWS_S3_KEY`, `DB_USERNAME`, `DB_PASSWORD` are referenced by the workflow but absent from `gh secret list`. `DB_USERNAME`/`DB_PASSWORD` are blocked by the commented-out database module but `BACKEND_AWS_S3_KEY` is used in `terraform init`.

5. **`dynamodb_table` backend parameter deprecated** — Terraform 1.14+ treats `dynamodb_table` as deprecated; log shows warning. Replacement is `use_lockfile = true`.

6. **OIDC trust scope too broad** — Live trust policy uses `StringLike` with `repo:infojasyrc/app-developer-experience:*`, allowing any ref (branch, tag, PR). Production deployments should be scoped to `ref:refs/heads/main`.

7. **Node.js 20 deprecation** — All four actions (`checkout@v4`, `upload-artifact@v4`, `configure-aws-credentials@v4`, `setup-terraform@v3.0.0`) run on Node.js 20, which becomes unsupported on June 2, 2026.

---

## Proposed Fixes

### Fix 1 (CRITICAL): Wire Terraform provider to assume sub-roles — `cloud/terraform/aws/versions.tf`

The `appdevexp-deployer` role can already assume the sub-roles (sts:AssumeRole is ALLOW). The Terraform provider just needs to be told to use them.

```diff
 provider "aws" {
   region = var.aws_account_region
+
+  assume_role {
+    role_arn = "arn:aws:iam::${var.aws_account_id}:role/appdevexp-ecs-deploy-role"
+  }
 }
+
+provider "aws" {
+  alias  = "waf"
+  region = var.aws_account_region
+
+  assume_role {
+    role_arn = "arn:aws:iam::${var.aws_account_id}:role/appdevexp-waf-role"
+  }
+}
+
+provider "aws" {
+  alias  = "logs"
+  region = var.aws_account_region
+
+  assume_role {
+    role_arn = "arn:aws:iam::${var.aws_account_id}:role/appdevexp-logs-role"
+  }
+}
+
+provider "aws" {
+  alias  = "kms"
+  region = var.aws_account_region
+
+  assume_role {
+    role_arn = "arn:aws:iam::${var.aws_account_id}:role/appdevexp-kms-manage-role"
+  }
+}
```

Then assign `providers = { aws = aws.logs }` in `module "logging"`, `providers = { aws = aws.waf }` in `module "security"`, `providers = { aws = aws.kms }` in `module "kms"`, etc. in `main.tf`.

**Alternative (simpler, less least-privilege):** Add all required permissions as inline policies directly to the `appdevexp-deployer` role, referencing the existing templates for the permission sets. This does not require Terraform refactoring but collapses the least-privilege design.

### Fix 2 (CRITICAL): Import the orphaned CloudWatch log group

Run this manually before the next apply to sync state:

```bash
cd cloud/terraform/aws
terraform init \
  -backend-config="bucket=<BACKEND_AWS_S3_BUCKET>" \
  -backend-config="key=<BACKEND_AWS_S3_KEY>" \
  -backend-config="region=us-west-1" \
  -backend-config="use_lockfile=true"

terraform import module.logging.aws_cloudwatch_log_group.vpc_flow_logs \
  /aws/vpc/flowlogs/appdevexp-dev
```

Also change `create_before_destroy` on the VPC flow log group in `cloud/terraform/aws/module/logging/main.tf`:

```diff
 resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
   name              = "/aws/vpc/flowlogs/${var.application_name}"
   retention_in_days = var.logs_retention_days
   kms_key_id        = var.kms_key_id
   tags              = var.tags

   lifecycle {
-    create_before_destroy = true
+    create_before_destroy = false
   }
 }
```

### Fix 3 (WARNING): Resolve AWS_ACCOUNT_ID secret/variable mismatch — `.github/workflows/deploy_cm_infrastructure.yml`

```diff
-      TF_VAR_aws_account_id: ${{ vars.AWS_ACCOUNT_ID }}
+      TF_VAR_aws_account_id: ${{ secrets.AWS_ACCOUNT_ID }}
```

Or alternatively, move `AWS_ACCOUNT_ID` from secrets to repository variables in GitHub Settings → Variables, keeping the `vars.` reference.

### Fix 4 (WARNING): Replace deprecated `dynamodb_table` backend parameter — `.github/workflows/deploy_cm_infrastructure.yml`

```diff
       - name: Terraform Init
         run: |
           terraform init -input=false -lockfile=readonly \
             -backend-config="bucket=${{secrets.BACKEND_AWS_S3_BUCKET}}" \
             -backend-config="key=${{secrets.BACKEND_AWS_S3_KEY}}" \
             -backend-config="region=${{env.AWS_REGION}}" \
-            -backend-config="dynamodb_table=${{vars.BACKEND_AWS_DYNAMODB_TABLE}}"
+            -backend-config="use_lockfile=true"
```

### Fix 5 (INFO): Upgrade action versions to Node.js 24 — `.github/workflows/deploy_cm_infrastructure.yml`

```diff
-      - uses: actions/checkout@v4
+      - uses: actions/checkout@v5
-      - uses: aws-actions/configure-aws-credentials@v4
+      - uses: aws-actions/configure-aws-credentials@v5
-      - uses: hashicorp/setup-terraform@v3.0.0
+      - uses: hashicorp/setup-terraform@v3
-      - uses: actions/upload-artifact@v4
+      - uses: actions/upload-artifact@v5
```

*(Verify latest tag versions before applying — these are illustrative.)*

---

## Secrets to add (if any)

| Secret name | Value source | How to add |
|---|---|---|
| `BACKEND_AWS_S3_KEY` | S3 key path for TF state (e.g. `conference-manager/dev/terraform.tfstate`) | `gh secret set BACKEND_AWS_S3_KEY` |
| `DB_USERNAME` | RDS master username | `gh secret set DB_USERNAME` (blocked by commented module — lower priority) |
| `DB_PASSWORD` | RDS master password | `gh secret set DB_PASSWORD` (blocked by commented module — lower priority) |

⚠️ Do not add secrets via Claude — run `gh secret set` commands yourself or use GitHub Settings → Secrets UI.

Also resolve: move `AWS_ACCOUNT_ID` from secrets to **repository variable** (Settings → Secrets and variables → Variables), OR update the workflow to use `secrets.AWS_ACCOUNT_ID`.

---

## Verification steps after applying fixes

1. Run `terraform import module.logging.aws_cloudwatch_log_group.vpc_flow_logs /aws/vpc/flowlogs/appdevexp-dev`
2. Run `gh workflow run deploy_cm_infrastructure.yml` and confirm OIDC authentication succeeds
3. Confirm `wafv2:PutLoggingConfiguration` no longer returns `AccessDeniedException` in the apply log
4. Run `aws iam simulate-principal-policy --policy-source-arn <deployer-arn> --action-names wafv2:PutLoggingConfiguration logs:CreateLogGroup` and verify `allowed`
5. Check `gh run view <new-run-id> --log-failed` — expect zero Terraform errors

---

## Suggested commit

```
ci(gha): fix Terraform provider role assumption and CloudWatch state drift

- Wire Terraform AWS provider to assume service sub-roles per resource domain
  (waf, logs, kms, ecs-deploy) — deployer role lacked direct service permissions
- Import orphaned CloudWatch log group to resolve ResourceAlreadyExistsException
- Change create_before_destroy=false on vpc_flow_logs to prevent replace cycle
- Move AWS_ACCOUNT_ID lookup from vars to secrets namespace
- Replace deprecated dynamodb_table backend param with use_lockfile=true

Refs: PIPELINE_DEBUG_REPORT.md
```

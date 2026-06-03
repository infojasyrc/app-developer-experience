# Pipeline Debug Report
Date: 2026-06-03
Workflow: `.github/workflows/ci_cm_components.yml`
Run ID: 26910594740
Job ID: 79387289597
Branch: main
Triggered by: PR merge — `feat(cm-webapp): added migration phase 05 (#165)`

---

## Root Cause

The `appdevexp-deployer` OIDC role assumed by GitHub Actions only has a `terraform-backend` inline policy (S3/DynamoDB + `sts:AssumeRole`); it has no ECR permissions, so `ecr:GetAuthorizationToken` fails immediately when the ECR login step runs.

---

## Evidence

```
Build, push, and deploy conference webapp  Login to Amazon ECR
2026-06-03T20:19:44.1536797Z Using environment variable credentials.
2026-06-03T20:19:44.5897769Z ##[error]User: arn:aws:sts::580976914278:assumed-role/appdevexp-deployer/GitHubActions
  is not authorized to perform: ecr:GetAuthorizationToken on resource: *
  because no identity-based policy allows the ecr:GetAuthorizationToken action
```

Step 4 (`Login to Amazon ECR`) failed — all downstream steps (build, push, ECS deploy) were skipped.

---

## Contributing Factors

1. **Deployer role has no ECR policy.** `bootstrap-deployer` in `aws-roles.mk` only attaches `terraform-backend` (Terraform state + `sts:AssumeRole`). No ECR permissions are ever attached to `appdevexp-deployer`.

2. **ECR push permissions are on the wrong role.** `ecs-deploy-policy.json.tpl` (attached to `appdevexp-ecs-deploy-role`) has read-only ECR actions (`GetAuthorizationToken`, `BatchGetImage`, etc.) but not push actions (`InitiateLayerUpload`, `UploadLayerPart`, `CompleteLayerUpload`, `PutImage`). Even if the workflow assumed `appdevexp-ecs-deploy-role`, a push would still fail.

3. **Region condition on `GetAuthorizationToken`.** The `ECRAccess` statement in `ecs-deploy-policy.json.tpl` applies an `aws:RequestedRegion` condition to `ecr:GetAuthorizationToken`. This action targets the global ECR endpoint, not a regional one, so a region condition can silently deny the call.

---

## Proposed Fix

### Fix 1: New ECR push policy template — `cloud/terraform/aws/iam/ecr-push-policy.json.tpl`

Create a new template that grants the deployer role the minimum permissions needed to authenticate to ECR and push images. `GetAuthorizationToken` must target `*` with **no region condition** (global API call).

```diff
+ File: cloud/terraform/aws/iam/ecr-push-policy.json.tpl (new)
+
+ {
+   "Version": "2012-10-17",
+   "Statement": [
+     {
+       "Sid": "ECRGetToken",
+       "Effect": "Allow",
+       "Action": [
+         "ecr:GetAuthorizationToken"
+       ],
+       "Resource": "*"
+     },
+     {
+       "Sid": "ECRPush",
+       "Effect": "Allow",
+       "Action": [
+         "ecr:BatchCheckLayerAvailability",
+         "ecr:InitiateLayerUpload",
+         "ecr:UploadLayerPart",
+         "ecr:CompleteLayerUpload",
+         "ecr:PutImage",
+         "ecr:DescribeImages",
+         "ecr:DescribeRepositories",
+         "ecr:ListImages"
+       ],
+       "Resource": "arn:aws:ecr:__AWS_REGION__:__AWS_ACCOUNT_ID__:repository/*",
+       "Condition": {
+         "StringEquals": {
+           "aws:RequestedRegion": "__AWS_REGION__"
+         }
+       }
+     }
+   ]
+ }
```

### Fix 2: Add render + update + bootstrap targets — `cloud/terraform/aws/makefiles/aws-roles.mk`

```diff
 render-all-policies: render-trust-policy render-backend-policy render-service-trust render-ecs-policy render-kms-policy render-waf-policy render-logs-policy render-s3-policy render-task-execution-policy render-task-role-policy render-permissions-boundary ## Render all 11 policy JSON files from templates
+render-all-policies: render-trust-policy render-backend-policy render-service-trust render-ecs-policy render-kms-policy render-waf-policy render-logs-policy render-s3-policy render-task-execution-policy render-task-role-policy render-permissions-boundary render-ecr-push-policy ## Render all 12 policy JSON files from templates
```

```diff
+render-ecr-push-policy: _mkdir-tmp ## Render ECR push policy JSON from template
+	@cat iam/ecr-push-policy.json.tpl \
+		| sed 's/__AWS_ACCOUNT_ID__/$(AWS_ACCOUNT_ID)/g' \
+		| sed 's/__AWS_REGION__/$(AWS_REGION)/g' \
+		> $(TMP)/ecr-push-policy.json
+	@echo "Rendered: $(TMP)/ecr-push-policy.json"
```

```diff
 bootstrap-deployer: render-trust-policy render-backend-policy ## Create OIDC deployer role and attach backend policy
+bootstrap-deployer: render-trust-policy render-backend-policy render-ecr-push-policy ## Create OIDC deployer role and attach backend + ECR push policies
 	@echo "Creating OIDC deployer role..."
 	aws iam create-role \
 		--role-name $(DEPLOYER_ROLE) \
 		--assume-role-policy-document file://$(TMP)/terraform-trust-policy.json \
 		--description "GitHub Actions OIDC deployer - assume-only entry point"
 	aws iam put-role-policy \
 		--role-name $(DEPLOYER_ROLE) \
 		--policy-name terraform-backend \
 		--policy-document file://$(TMP)/terraform-backend-policy.json
+	aws iam put-role-policy \
+		--role-name $(DEPLOYER_ROLE) \
+		--policy-name ecr-push \
+		--policy-document file://$(TMP)/ecr-push-policy.json
 	@echo "Done: $(DEPLOYER_ROLE)"
```

```diff
 update-deployer: render-backend-policy ## Re-apply backend policy to deployer role
+update-deployer: render-backend-policy render-ecr-push-policy ## Re-apply backend and ECR push policies to deployer role
 	aws iam put-role-policy \
 		--role-name $(DEPLOYER_ROLE) \
 		--policy-name terraform-backend \
 		--policy-document file://$(TMP)/terraform-backend-policy.json
+	aws iam put-role-policy \
+		--role-name $(DEPLOYER_ROLE) \
+		--policy-name ecr-push \
+		--policy-document file://$(TMP)/ecr-push-policy.json
 	@echo "Updated: $(DEPLOYER_ROLE)"
```

### Fix 3: Remove region condition from `ecr:GetAuthorizationToken` in `ecs-deploy-policy.json.tpl`

The `ECRAccess` statement currently bundles `GetAuthorizationToken` with a `RequestedRegion` condition that silently denies the global API call. Split into two statements.

```diff
-    {
-      "Sid": "ECRAccess",
-      "Effect": "Allow",
-      "Action": [
-        "ecr:GetAuthorizationToken",
-        "ecr:BatchCheckLayerAvailability",
-        "ecr:GetDownloadUrlForLayer",
-        "ecr:BatchGetImage",
-        "ecr:DescribeRepositories",
-        "ecr:ListImages",
-        "ecr:DescribeImages"
-      ],
-      "Resource": "*",
-      "Condition": {
-        "StringEquals": {
-          "aws:RequestedRegion": "__AWS_REGION__"
-        }
-      }
-    },
+    {
+      "Sid": "ECRGetToken",
+      "Effect": "Allow",
+      "Action": [
+        "ecr:GetAuthorizationToken"
+      ],
+      "Resource": "*"
+    },
+    {
+      "Sid": "ECRRead",
+      "Effect": "Allow",
+      "Action": [
+        "ecr:BatchCheckLayerAvailability",
+        "ecr:GetDownloadUrlForLayer",
+        "ecr:BatchGetImage",
+        "ecr:DescribeRepositories",
+        "ecr:ListImages",
+        "ecr:DescribeImages"
+      ],
+      "Resource": "*",
+      "Condition": {
+        "StringEquals": {
+          "aws:RequestedRegion": "__AWS_REGION__"
+        }
+      }
+    },
```

---

## Secrets to add

No new secrets required. `AWS_ROLE_ARN` is already configured.

⚠️ Do not add secrets via Claude — use `gh secret set` or GitHub repository Settings → Secrets UI.

---

## How to apply fixes

After editing the templates and Makefile per the diffs above, apply the new ECR push policy to the live role with:

```bash
cd cloud/terraform/aws
make update-deployer \
  AWS_ACCOUNT_ID=<account-id> \
  AWS_REGION=us-west-1 \
  TF_STATE_BUCKET=<bucket> \
  TF_LOCK_TABLE=<table> \
  GITHUB_USER=infojasyrc \
  REPO_NAME=app-developer-experience \
  APP_NAME=appdevexp
```

Then also update the ECS deploy role to fix the bundled condition:

```bash
make update-ecs-role \
  AWS_ACCOUNT_ID=<account-id> \
  AWS_REGION=us-west-1 \
  TF_STATE_BUCKET=<bucket> \
  TF_LOCK_TABLE=<table> \
  GITHUB_USER=infojasyrc \
  REPO_NAME=app-developer-experience \
  APP_NAME=appdevexp
```

---

## Verification steps after applying fixes

1. Re-run the failed workflow: `gh run rerun 26910594740 --failed`
2. Confirm step 4 (`Login to Amazon ECR`) exits green
3. Confirm step 6 (`Build container image`) and step 7 (`Push image to ECR`) complete
4. Confirm overall job conclusion is `success`

---

## Suggested commit

```
ci(gha): add ECR push policy to appdevexp-deployer role

- Add iam/ecr-push-policy.json.tpl with GetAuthorizationToken (no region
  condition) and push actions scoped to repository ARN
- Update aws-roles.mk: render-ecr-push-policy, update-deployer,
  bootstrap-deployer now attach ecr-push inline policy
- Split ECRAccess statement in ecs-deploy-policy.json.tpl to isolate
  GetAuthorizationToken from the RequestedRegion condition

Refs: PIPELINE_DEBUG_REPORT_20260603.md
```

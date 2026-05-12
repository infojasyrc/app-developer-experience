# Pipeline Debug Report

Date: 2026-05-12
Workflow: `.github/workflows/pull_request_cm_infrastructure.yml`
Run ID: 25714513898
Branch: `cloud-aws/fix/deployment-issues-base-elements`
PR: #140

---

## Root Cause

`GitHubActionsTerraformRole` (the OIDC identity used by the workflow) cannot
chain-assume the five provider-alias service roles defined in `versions.tf`
because the live `TerraformBackendPolicy` has no `sts:AssumeRole` statement and
all five service role trust policies restrict assumption to `appdevexp-deployer`
only — leaving both sides of the AWS role-chaining handshake broken.

---

## Evidence

```
Error: Cannot assume IAM Role

  with provider["registry.terraform.io/hashicorp/aws"].ecs,
  on versions.tf line 19, in provider "aws":

IAM Role (arn:aws:iam::***:role/appdevexp-ecs-deploy-role) cannot be assumed.

AccessDenied: User:
arn:aws:sts::***:assumed-role/GitHubActionsTerraformRole/GitHubActions
is not authorized to perform: sts:AssumeRole on resource:
arn:aws:iam:::role/appdevexp-ecs-deploy-role
```

Same `AccessDenied` / HTTP 403 repeated for all five aliases:
`ecs` → `appdevexp-ecs-deploy-role`
`kms` → `appdevexp-kms-manage-role`
`logs` → `appdevexp-logs-role`
`waf`  → `appdevexp-waf-role`
`s3`   → `appdevexp-s3-manage-role`

`aws iam simulate-principal-policy` confirms `implicitDeny` for all five
`sts:AssumeRole` calls — no explicit deny, simply no allow on either side.

---

## Contributing Factors

1. **OIDC auth succeeded** — `GitHubActionsTerraformRole` was correctly assumed
   via `aws-actions/configure-aws-credentials@v4`. Failure is entirely inside
   `terraform plan` provider initialization, not in the GHA YAML itself.

2. **PR #140 is architecturally correct** — Adding `assume_role` blocks to
   `versions.tf` is the intended fix from INFRA_PLAN.md Phase A finding #1.
   The PR uncovered that the IAM layer was never updated to support the new
   identity (`GitHubActionsTerraformRole`) doing the assuming.

3. **Live `TerraformBackendPolicy` missing `AssumeServiceRoles` SID** — The
   template `terraform-backend-policy.json.tpl` contains the correct
   `AssumeServiceRoles` statement granting `sts:AssumeRole` on all five roles.
   However the live managed policy (`arn:aws:iam::580976914278:policy/TerraformBackendPolicy`)
   was never updated with this SID. `GitHubActionsTerraformRole` therefore has
   no identity-policy permission to call `sts:AssumeRole`.

4. **Service role trust policies scoped to `appdevexp-deployer` only** — All
   five roles were bootstrapped with `service-trust-policy.json.tpl` which
   trusts only `arn:aws:iam::580976914278:role/appdevexp-deployer`. The workflow
   uses `GitHubActionsTerraformRole` (a separate, separately-created role), so
   none of the five trust policies allow it to be the calling principal.

5. **No Makefile target covers `GitHubActionsTerraformRole`** — `aws-roles.mk`
   `update-*` targets only manage `appdevexp-deployer`. There is no target to
   update `TerraformBackendPolicy` or the service role trust policies for
   `GitHubActionsTerraformRole`.

---

## Failure location

**Inside `terraform plan`** — provider initialization phase (before any resource
is evaluated). The GHA OIDC step and `terraform init` complete successfully;
the plan fails at provider `assume_role` resolution.

---

## Proposed Fix

### Fix 1 (CRITICAL): Add `AssumeServiceRoles` to `TerraformBackendPolicy`

The template already has the correct statement. The live managed policy must be
updated to a new version that includes it.

Admin action (run from `cloud/terraform/aws/` — do NOT run via Claude):

```bash
# 1. Render the updated backend policy from the existing template
make render-backend-policy   # outputs /tmp/appdevexp/terraform-backend-policy.json

# 2. Create a new version of the managed policy
POLICY_ARN="arn:aws:iam::580976914278:policy/TerraformBackendPolicy"
aws iam create-policy-version \
  --policy-arn "$POLICY_ARN" \
  --policy-document file:///tmp/appdevexp/terraform-backend-policy.json \
  --set-as-default

# 3. (Optional cleanup) Delete the oldest non-default version if at limit
aws iam list-policy-versions --policy-arn "$POLICY_ARN" --output table
```

The SID being added:
```diff
+{
+  "Sid": "AssumeServiceRoles",
+  "Effect": "Allow",
+  "Action": "sts:AssumeRole",
+  "Resource": [
+    "arn:aws:iam::580976914278:role/appdevexp-ecs-deploy-role",
+    "arn:aws:iam::580976914278:role/appdevexp-kms-manage-role",
+    "arn:aws:iam::580976914278:role/appdevexp-waf-role",
+    "arn:aws:iam::580976914278:role/appdevexp-logs-role",
+    "arn:aws:iam::580976914278:role/appdevexp-s3-manage-role"
+  ]
+}
```

### Fix 2 (CRITICAL): Update service role trust policies to trust `GitHubActionsTerraformRole`

No Makefile target exists for updating trust policies. Use AWS CLI directly.

New trust document (rendered from `service-trust-policy.json.tpl` + addition):

```diff
 {
   "Version": "2012-10-17",
   "Statement": [
     {
       "Effect": "Allow",
       "Principal": {
         "AWS": "arn:aws:iam::580976914278:root"
       },
       "Action": "sts:AssumeRole",
       "Condition": {
         "ArnLike": {
-          "aws:PrincipalArn": "arn:aws:iam::580976914278:role/appdevexp-deployer"
+          "aws:PrincipalArn": [
+            "arn:aws:iam::580976914278:role/appdevexp-deployer",
+            "arn:aws:iam::580976914278:role/GitHubActionsTerraformRole"
+          ]
         }
       }
     }
   ]
 }
```

Admin command (do NOT run via Claude):
```bash
TRUST_DOC='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"AWS": "arn:aws:iam::580976914278:root"},
    "Action": "sts:AssumeRole",
    "Condition": {"ArnLike": {"aws:PrincipalArn": [
      "arn:aws:iam::580976914278:role/appdevexp-deployer",
      "arn:aws:iam::580976914278:role/GitHubActionsTerraformRole"
    ]}}
  }]
}'

for role in \
  appdevexp-ecs-deploy-role \
  appdevexp-kms-manage-role \
  appdevexp-logs-role \
  appdevexp-waf-role \
  appdevexp-s3-manage-role; do
  aws iam update-assume-role-policy \
    --role-name "$role" \
    --policy-document "$TRUST_DOC"
  echo "Updated trust: $role"
done
```

Also update `service-trust-policy.json.tpl` to include `GitHubActionsTerraformRole`
so future `bootstrap-service-roles` / `bootstrap-all` runs produce the correct
trust policy automatically.

---

## Secrets to add (if any)

None — `AWS_ROLE_ARN` is correctly set and resolves to `GitHubActionsTerraformRole`.

⚠️ Do not add secrets via Claude — run `gh secret set` commands yourself
   or use the GitHub repository Settings → Secrets UI.

---

## Verification steps after applying fixes

1. `make verify-service-roles` from `cloud/terraform/aws/` — confirm all 5 roles list policies
2. Run `aws iam simulate-principal-policy` for `sts:AssumeRole` on each service role — expect `allowed`
3. Trigger a re-run on PR #140 — `terraform plan` should reach the resource planning phase
4. Confirm no `AccessDenied` / `Cannot assume IAM Role` errors in the new run log

---

## Suggested commit

```
ci(gha): add sts:AssumeRole to TerraformBackendPolicy and update service role trust

- TerraformBackendPolicy was missing AssumeServiceRoles SID — template was correct
  but live managed policy was never updated with the sts:AssumeRole statement
- Service role trust policies scoped to appdevexp-deployer only; add
  GitHubActionsTerraformRole as trusted principal for all 5 provider-alias roles
- Update service-trust-policy.json.tpl to reflect both trusted principals

Refs: PIPELINE_DEBUG_REPORT.md PR #140
```

# Pipeline Debug Report

Date: 2026-05-14
Workflow: `.github/workflows/pull_request_cm_infrastructure.yml`
Run ID: 25837618529
Branch: `cloud-aws/fix/deployment-issues-base-elements`
PR: #140

---

## Root Cause

The `terraform-backend` inline policy on `appdevexp-deployer` grants S3 access
to `arn:aws:s3:::tf-state-ade-bucketex-unique` (typo — missing trailing "p"),
but the actual state bucket is `tf-state-ade-bucketexp-unique`; the bucket
referenced in the policy does not exist, so the S3 `HeadObject` call during
`terraform init` lands on a resource with no Allow → 403 Forbidden.

---

## Evidence

```
Terraform Init  Successfully configured the backend "s3"!
Terraform Init  Error: Error refreshing state: Unable to access object "***"
                in S3 bucket "***": operation error S3: HeadObject,
                https response error StatusCode: 403,
                RequestID: ZHNAW91QDCESN50D,
                api error Forbidden: Forbidden
Terraform Init  ##[error]Terraform exited with code 1.
```

OIDC authentication **succeeded** — `AWS_ACCESS_KEY_ID / SECRET / SESSION_TOKEN`
are all masked-and-set in the run. The failure is inside Terraform, after
`configure-aws-credentials` completes.

---

## Contributing Factors

1. **Live inline policy targets wrong bucket name.** `appdevexp-deployer` inline
   policy `terraform-backend` (Statement `TerraformStateManagement`) was applied
   with:
   ```
   arn:aws:s3:::tf-state-ade-bucketex-unique      ← does not exist (404)
   arn:aws:s3:::tf-state-ade-bucketex-unique/*
   ```
   Actual bucket confirmed via `aws s3api list-buckets`:
   ```
   tf-state-ade-bucketexp-unique                  ← correct name (exists)
   ```

2. **Template is correct — typo was introduced at bootstrap time.**
   `iam/terraform-backend-policy.json.tpl` uses the `__TF_STATE_BUCKET__`
   placeholder and is not the source of the bug. When `make bootstrap-deployer`
   was originally run, `TF_STATE_BUCKET` was set to `tf-state-ade-bucketex-unique`
   (missing "p"). The template was never re-rendered with the correct name.

3. **New failure, independent of previous plan (run 25714513898).**
   The previous plan fixed the `GitHubActionsTerraformRole` / `sts:AssumeRole`
   chaining issue. After that fix the workflow `AWS_ROLE_ARN` was updated to
   `appdevexp-deployer`, which exposed this latent typo in the deployer policy.

---

## Failure location

**Inside `terraform init`** — state refresh phase. The GHA step
`Configure AWS credentials` and the S3 backend configuration line both succeed.
The failure is the `HeadObject` call Terraform issues immediately after to read
or confirm the remote state file.

---

## Proposed Fix

### Fix 1 (CRITICAL): Re-apply `terraform-backend` inline policy with correct bucket name

No `.tf` file, workflow file, or Makefile change needed. One `make update-deployer`
invocation with the correct variable re-renders the template and calls
`aws iam put-role-policy` to replace the policy in-place.

**Diff applied to the live policy Statement `TerraformStateManagement`:**
```diff
  "Resource": [
-   "arn:aws:s3:::tf-state-ade-bucketex-unique",
-   "arn:aws:s3:::tf-state-ade-bucketex-unique/*"
+   "arn:aws:s3:::tf-state-ade-bucketexp-unique",
+   "arn:aws:s3:::tf-state-ade-bucketexp-unique/*"
  ]
```

**Admin command (do NOT run via Claude):**
```bash
cd cloud/terraform/aws
make update-deployer \
  TF_STATE_BUCKET=tf-state-ade-bucketexp-unique \
  TF_LOCK_TABLE=ade-terraform-lock-table \
  AWS_ACCOUNT_ID=580976914278 \
  AWS_REGION=us-west-1 \
  GITHUB_USER=infojasyrc \
  REPO_NAME=app-developer-experience \
  APP_NAME=appdevexp
```

`update-deployer` calls `render-backend-policy` (substitutes the placeholder)
then calls `aws iam put-role-policy` — overwrites the inline policy atomically.

---

## Secrets to add (if any)

None required. `AWS_ROLE_ARN` and the DEV-environment `BACKEND_AWS_S3_BUCKET`
secret (`tf-state-ade-bucketexp-unique`) are already correctly configured.

⚠️ Do not add secrets via Claude — use `gh secret set` or GitHub Settings UI.

---

## Verification steps after applying fix

1. Confirm policy update:
   ```bash
   cd cloud/terraform/aws && make verify-deployer
   # "tf-state-ade-bucketexp-unique" must appear in the JSON output
   ```

2. Re-run the failing workflow:
   ```bash
   gh run rerun 25837618529 --failed
   ```

3. Confirm `terraform init` succeeds:
   ```bash
   gh run view <new-run-id> --log-failed
   # Expected: no output (no failures)
   ```

---

## Suggested commit

```
ci(gha): fix terraform-backend policy bucket ARN typo in appdevexp-deployer

- Re-render and re-apply terraform-backend-policy.json.tpl with correct
  TF_STATE_BUCKET=tf-state-ade-bucketexp-unique (was missing trailing "p")
- Live policy referenced a non-existent bucket, causing 403 on every
  terraform init state refresh (HeadObject)

Refs: PIPELINE_DEBUG_REPORT.md PR #140
```

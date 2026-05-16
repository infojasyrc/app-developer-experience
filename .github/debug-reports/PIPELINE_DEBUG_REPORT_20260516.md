# Pipeline Debug Report

Date: 2026-05-16
Workflow: `.github/workflows/pull_request_cm_infrastructure.yml`
Run ID: 25841021049
Branch: `cloud-aws/fix/deployment-issues-base-elements`
PR: #140

---

## Root Cause

`TF_VAR_aws_account_id` resolves to an empty string in the workflow, causing all
five provider `assume_role.role_arn` values in `versions.tf` to render as
`arn:aws:iam:::role/<name>` (malformed ARN — no account ID), which AWS STS
rejects with AccessDenied before Terraform can plan any resource.

---

## Evidence

```
Planning failed. Terraform encountered an error while generating this plan.

│ Error: Cannot assume IAM Role
│
│   with provider["registry.terraform.io/hashicorp/aws"].ecs,
│   on versions.tf line 19, in provider "aws":
│   19: provider "aws" {
│
│ IAM Role (arn:aws:iam:::role/appdevexp-ecs-deploy-role) cannot be assumed.
│
│ Error: operation error STS: AssumeRole, https response error StatusCode:
│ 403, RequestID: 2a2da6c5-eb00-401b-9e8a-af11e97192c1, api error
│ AccessDenied: User:
│ arn:aws:sts::***:assumed-role/appdevexp-deployer/GitHubActions is
│ not authorized to perform: sts:AssumeRole on resource:
│ arn:aws:iam:::role/appdevexp-ecs-deploy-role
```

Same error repeats for all five aliased providers:
`appdevexp-ecs-deploy-role`, `appdevexp-kms-manage-role`,
`appdevexp-logs-role`, `appdevexp-waf-role`, `appdevexp-s3-manage-role`.

Note: `arn:aws:iam:::role/...` (three colons, empty account field) is a
malformed ARN produced when `var.aws_account_id = ""`.

---

## Failure location

**Inside `terraform plan` — not in a GHA step.**

OIDC authentication succeeded (the session `assumed-role/appdevexp-deployer/GitHubActions`
is visible in the error, meaning `Configure AWS credentials` passed). The failure
occurs at Terraform provider initialisation when each aliased provider tries
`sts:AssumeRole` with a malformed ARN.

---

## Contributing Factors

1. `AWS_ACCOUNT_ID` repo-level secret is empty or its value does not render
   into `TF_VAR_aws_account_id` (created 2026-01-25, never verified after
   the role-swap on 2026-05-14).
2. `versions.tf` constructs all five provider role ARNs from
   `var.aws_account_id` — one bad secret poisons every aliased provider.
3. `AWS_ACCOUNT_ID` is not defined in the DEV environment secrets; it relies
   entirely on the repo-level secret, which has no environment fallback.

---

## IAM state (confirmed correct — not the blocker)

| Check | Status | Detail |
|---|---|---|
| OIDC provider | ✅ | `arn:aws:iam::580976914278:oidc-provider/token.actions.githubusercontent.com` |
| `appdevexp-deployer` OIDC trust | ✅ | `repo:infojasyrc/app-developer-experience:*` |
| `appdevexp-deployer` identity policy `AssumeServiceRoles` | ✅ | All 5 service role ARNs listed |
| Service role trust policies | ✅ | All 5 roles trust `appdevexp-deployer` |
| Permissions boundary on deployer | ✅ N/A | None applied |
| IAM permission simulation `sts:AssumeRole` (correct ARNs) | ✅ `allowed` | All 5 roles — IAM setup is correct |

The IAM setup is fully functional when correct ARNs are used. The sole blocker
is the empty account ID producing malformed ARNs.

---

## Proposed Fix

### Fix 1: Set `AWS_ACCOUNT_ID` in the DEV environment — workflow secrets

```diff
# Run once — do not commit this command, it modifies GitHub secrets
- # AWS_ACCOUNT_ID not set in DEV environment
+ gh secret set AWS_ACCOUNT_ID \
+   --env DEV \
+   --body "580976914278"
```

This ensures the `DEV` environment job always has the correct account ID
independently of the repo-level secret (which may be stale).

### Fix 2 (alternative): Update the repo-level secret value

```bash
# If preferring a single repo-level secret
gh secret set AWS_ACCOUNT_ID \
  --body "580976914278"
```

⚠️ Do not add secrets via Claude — run `gh secret set` yourself or use
   GitHub repository Settings → Environments → DEV → Secrets.

---

## Secrets to add / fix

| Secret name | Scope | Value | How to add |
|---|---|---|---|
| `AWS_ACCOUNT_ID` | DEV environment (recommended) | `580976914278` | `gh secret set AWS_ACCOUNT_ID --env DEV --body "580976914278"` |

---

## Secondary finding — `GitHubActionsTerraformRole` orphan role

`GitHubActionsTerraformRole` still exists in IAM with zero policies. It is no
longer referenced by `AWS_ROLE_ARN` (which now points to `appdevexp-deployer`
per Option B of INFRA_PLAN_PR_140_20260514.md). It should be deleted or given
policies if it is still needed for anything. ⚠️ NEEDS HUMAN REVIEW

---

## Verification steps after applying fix

1. Set the secret per Fix 1 or Fix 2 above.
2. Rerun the failed workflow:
   ```bash
   gh run rerun 25841021049 --failed
   ```
3. Check the new run:
   ```bash
   gh run view <new-run-id> --log-failed
   ```
4. Expected: `Terraform Plan` step succeeds (or fails on a resource conflict,
   not on provider auth).

---

## Suggested commit

No code file changes are required. The fix is a secrets configuration change
only. If a tracking commit is desired:

```
ci(gha): document AWS_ACCOUNT_ID secret requirement for DEV environment

- terraform plan failing with malformed provider ARNs (empty account ID)
  because TF_VAR_aws_account_id resolves to empty string
- fix is to set AWS_ACCOUNT_ID in the DEV environment scope
- IAM setup (deployer policy, service role trust) confirmed correct via
  permission simulation

Refs: PIPELINE_DEBUG_REPORT_20260516.md, INFRA_PLAN_PR_140_20260516.md
```

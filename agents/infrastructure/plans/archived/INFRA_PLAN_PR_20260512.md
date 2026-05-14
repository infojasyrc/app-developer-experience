# INFRA_PLAN — PR #140 Addendum

Date: 2026-05-12
Environment: dev
PR: #140 (`cloud-aws/fix/deployment-issues-base-elements`)
Pipeline run cross-referenced: 25714513898 (2026-05-12, failed)
Base plan: `agents/infrastructure/plans/INFRA_PLAN.md` (2026-05-05)

> This addendum documents findings specific to the PR #140 failure.
> Do NOT modify `INFRA_PLAN.md` — this file extends it.

---

## Error Classification

**Auth / IAM role-chaining failure** — both sides of the `sts:AssumeRole`
handshake are broken simultaneously:
- Identity policy: `GitHubActionsTerraformRole` has no permission to call
  `sts:AssumeRole` (missing from live `TerraformBackendPolicy`)
- Resource policy: all five service role trust policies only allow
  `appdevexp-deployer`, not `GitHubActionsTerraformRole`

Phases run: **B + C + D + E** (OIDC/auth classification per skill routing).

---

## Phase B: Makefile + IAM Template Findings (PR-specific)

### Makefile completeness

`cloud/terraform/aws/makefiles/aws-roles.mk` has full `render-*`, `update-*`,
`verify-*`, and `destroy-*` targets. However:

| Gap | Severity | Detail |
|---|---|---|
| No `update-service-trust` target | 🔴 CRITICAL | Trust policies of service roles cannot be updated via Makefile — must use AWS CLI `update-assume-role-policy` directly |
| No target for `TerraformBackendPolicy` (managed) | 🟡 WARNING | `update-deployer` applies to `appdevexp-deployer` inline policy only; `TerraformBackendPolicy` (managed, attached to `GitHubActionsTerraformRole`) requires a new `aws iam create-policy-version` call |

### Template security findings (PR-specific)

| # | Severity | Template | Issue | Fix |
|---|---|---|---|---|
| 1 | 🔴 CRITICAL | `service-trust-policy.json.tpl` | Trusts only `appdevexp-deployer` via `ArnLike`. `GitHubActionsTerraformRole` (the actual OIDC role used by the workflow) is not in the condition. PR #140's `versions.tf` provider aliases require this role to chain-assume service roles | Update template to include `GitHubActionsTerraformRole` in `aws:PrincipalArn` list |
| 2 | 🔴 CRITICAL | `terraform-backend-policy.json.tpl` | Template has the correct `AssumeServiceRoles` SID; live `TerraformBackendPolicy` managed policy is missing it — template and live diverged after initial creation | Re-render and create new managed policy version |

### Required env vars for the fix

| Variable | Used in | Notes |
|---|---|---|
| `AWS_ACCOUNT_ID` | render-backend-policy, all render targets | Must be set in `.env` or shell before running make |
| `AWS_REGION` | render-backend-policy | `us-west-1` for dev |
| `TF_STATE_BUCKET` | render-backend-policy | `tf-state-ade-bucketexp-unique` |
| `TF_LOCK_TABLE` | render-backend-policy | `ade-terraform-lock-table` |

---

## Phase C: Live AWS State Findings (PR-specific)

### OIDC Provider

| Check | Status | Detail |
|---|---|---|
| GHA OIDC provider exists | ✅ | `arn:aws:iam::580976914278:oidc-provider/token.actions.githubusercontent.com` |

### IAM Roles

| Role | Exists | Created | Permissions boundary |
|---|---|---|---|
| `GitHubActionsTerraformRole` | ✅ | 2026-02-09 | None |
| `appdevexp-deployer` | ✅ | 2026-03-24 | Not checked |
| `appdevexp-ecs-deploy-role` | ✅ | 2026-03-24 | — |
| `appdevexp-kms-manage-role` | ✅ | 2026-03-24 | — |
| `appdevexp-logs-role` | ✅ | 2026-03-24 | — |
| `appdevexp-waf-role` | ✅ | 2026-03-24 | — |
| `appdevexp-s3-manage-role` | ✅ | 2026-03-24 | — |

All roles exist — the problem is policy content, not missing roles.

### Cross-reference with static findings

- The live `TerraformBackendPolicy` statement list does not contain `sts:AssumeRole`.
  The template has it; the live managed policy does not. Drift was introduced when
  `GitHubActionsTerraformRole` was created outside the Makefile bootstrap process
  with a separately-authored managed policy.
- Service role trust policies match `service-trust-policy.json.tpl` exactly
  (only `appdevexp-deployer` trusted) — no drift from template, but the template
  itself is incomplete for the current workflow identity.

---

## Phase D: IAM Drift Findings (PR-specific)

### `TerraformBackendPolicy` (managed, attached to `GitHubActionsTerraformRole`)

| Check | Template (`terraform-backend-policy.json.tpl`) | Live AWS | Drift |
|---|---|---|---|
| `AssumeServiceRoles` SID — `sts:AssumeRole` on 5 roles | ✅ present | ❌ absent | 🔴 CRITICAL — live never updated from template |
| State S3 permissions | ✅ present | ✅ present | None |
| DynamoDB lock permissions | ✅ present | ✅ present | None |
| EC2 / ECS / ELB permissions | N/A in template | ✅ present (extra) | Live has more; acceptable |

### Service role trust policies (all five roles)

| Check | Template | Live AWS | Drift |
|---|---|---|---|
| Trusts `appdevexp-deployer` | ✅ `ArnLike` condition | ✅ matches | None |
| Trusts `GitHubActionsTerraformRole` | ❌ absent | ❌ absent | Template incomplete — new principal not added |

### Actions required to resolve drift

1. Update `terraform-backend-policy.json.tpl` to add `AssumeServiceRoles` SID
   (already present), then create new managed policy version
2. Update `service-trust-policy.json.tpl` to add `GitHubActionsTerraformRole`
   to the `aws:PrincipalArn` condition list
3. Run `aws iam update-assume-role-policy` for all five service roles (no
   Makefile target — admin must run AWS CLI directly)

---

## Phase E: Permission Simulation Results (PR-specific)

### `GitHubActionsTerraformRole` — `sts:AssumeRole` on each service role

| Target role | Decision | Cause |
|---|---|---|
| `appdevexp-ecs-deploy-role` | ❌ `implicitDeny` | No `sts:AssumeRole` in identity policy + not in trust policy |
| `appdevexp-kms-manage-role` | ❌ `implicitDeny` | Same |
| `appdevexp-logs-role` | ❌ `implicitDeny` | Same |
| `appdevexp-waf-role` | ❌ `implicitDeny` | Same |
| `appdevexp-s3-manage-role` | ❌ `implicitDeny` | Same |

All five are `implicitDeny` (not `explicitDeny`) — no SCP or boundary blocking,
simply no allow on either side of the handshake. Both sides must be fixed.

### Summary

- 🔴 CRITICAL denials: 5 (all provider-alias roles) — must fix before `terraform plan` can proceed
- 🟡 WARNING: 0

---

## Fix Actions (admin only — do not run via Claude)

### Step 1 — Update `TerraformBackendPolicy` managed policy

```bash
cd cloud/terraform/aws
make render-backend-policy   # renders /tmp/appdevexp/terraform-backend-policy.json

POLICY_ARN="arn:aws:iam::580976914278:policy/TerraformBackendPolicy"
aws iam create-policy-version \
  --policy-arn "$POLICY_ARN" \
  --policy-document file:///tmp/appdevexp/terraform-backend-policy.json \
  --set-as-default
```

### Step 2 — Update all five service role trust policies

No Makefile target exists. Run directly:

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

### Step 3 — Update `service-trust-policy.json.tpl` (template fix)

Update the template so future `bootstrap-service-roles` runs produce the correct
trust policy. This is a code change — include it in the PR or a follow-up PR:

```diff
-  "aws:PrincipalArn": "arn:aws:iam::__AWS_ACCOUNT_ID__:role/appdevexp-deployer"
+  "aws:PrincipalArn": [
+    "arn:aws:iam::__AWS_ACCOUNT_ID__:role/appdevexp-deployer",
+    "arn:aws:iam::__AWS_ACCOUNT_ID__:role/GitHubActionsTerraformRole"
+  ]
```

### Step 4 — Verify

```bash
# Confirm identity policy allows assume
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::580976914278:role/GitHubActionsTerraformRole \
  --action-names sts:AssumeRole \
  --resource-arns arn:aws:iam::580976914278:role/appdevexp-ecs-deploy-role \
  --query 'EvaluationResults[0].EvalDecision' --output text
# Expected: allowed

# Trigger PR re-run and confirm no AccessDenied in terraform plan
gh run list --branch cloud-aws/fix/deployment-issues-base-elements --limit 3
```

---

## Contradiction check with base INFRA_PLAN.md

| Base plan finding | Status |
|---|---|
| Phase A #1: add `assume_role` blocks to `versions.tf` | ✅ Implemented by PR #140 — correct approach |
| Phase B #5: `appdevexp-s3-manage-role` not in `AssumeServiceRoles` | ⚠️ Superseded — template HAS the role; live policy drift is the actual issue |

No contradictions. This addendum is additive — the base plan's fixes are still
valid; this PR revealed that the IAM identity and trust policies were not
updated to support the new `GitHubActionsTerraformRole` chain.

---

## Suggested commits per fix

```
ci(gha): update TerraformBackendPolicy to add AssumeServiceRoles SID

- Template terraform-backend-policy.json.tpl already contained AssumeServiceRoles
  but live managed policy was never updated — create new policy version to sync
- Grants GitHubActionsTerraformRole sts:AssumeRole on all 5 provider-alias roles

Refs: INFRA_PLAN_PR_140.md
```

```
infra(iam): update service-trust-policy template to trust GitHubActionsTerraformRole

- service-trust-policy.json.tpl only listed appdevexp-deployer as trusted principal
- Add GitHubActionsTerraformRole so provider-alias chain-assumes work from GHA
- Run make render-service-trust + aws iam update-assume-role-policy after merge

Refs: INFRA_PLAN_PR_140.md
```

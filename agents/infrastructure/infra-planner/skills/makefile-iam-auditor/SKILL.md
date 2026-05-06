---
name: makefile-iam-auditor
description: >
  Audits Makefile targets and .json.tpl templates in cloud/terraform/aws/iam/
  for GitHub Actions OIDC bootstrap. Validates that the root Makefile correctly
  orchestrates makefiles/ via include or sub-make, that IAM targets use AWS CLI
  with least-privilege templates, that OIDC trust conditions are scoped correctly,
  and that all required env vars are documented. Never executes Makefile targets
  or modifies templates. Produces Phase B findings for INFRA_PLAN.md. Run after
  terraform-module-auditor and before iam-template-validator.
metadata:
  author: app-dev-exp
  version: "1.0"
---

# makefile-iam-auditor

**Input:** `Makefile`, `makefiles/`, `cloud/terraform/aws/iam/*.json.tpl`
**Output:** Phase B (Makefile + Templates) findings section in `INFRA_PLAN.md`
**Tools:** `grep`, `find`, `cat` — static analysis only, no execution

---

## Step 1 — Load paths

```bash
cat agents/shared/context/monorepo-paths.md
cat agents/shared/context/commit-conventions.md
IAM_TEMPLATES="cloud/terraform/aws/iam"
MAKEFILE_DIR="makefiles"
```

## Step 2 — Discover Makefile structure

```bash
# How root Makefile orchestrates makefiles/
grep -n "include\|sub-make\|\$(MAKE)\|-C " Makefile | head -20

# All targets in root
grep -n "^[a-zA-Z_-][a-zA-Z0-9_-]*:" Makefile | sort

# All targets in makefiles/
grep -rn "^[a-zA-Z_-][a-zA-Z0-9_-]*:" $MAKEFILE_DIR/ | sort

# IAM-related targets specifically
grep -rn "aws iam\|oidc\|create-role\|put-role-policy\|attach-role-policy\|create-policy\|create-open-id" \
  Makefile $MAKEFILE_DIR/ 2>/dev/null
```

## Step 3 — Validate bootstrap target completeness

**Required targets — flag missing as 🟡 WARNING:**

| Purpose | AWS CLI command expected | Why required |
|---|---|---|
| OIDC provider creation | `aws iam create-open-id-connect-provider` | GHA auth foundation |
| Terraform role creation | `aws iam create-role --assume-role-policy-document` | GHA assumes this role |
| Policy attachment | `aws iam put-role-policy` or `attach-role-policy` | Grants Terraform permissions |
| Verification | `aws iam get-role` or `list-attached-role-policies` | Confirms setup |

```bash
# Check each expected AWS CLI command exists in Makefiles
for cmd in \
  "create-open-id-connect-provider" \
  "create-role" \
  "put-role-policy\|attach-role-policy\|create-policy" \
  "get-role\|list-attached-role-policies"; do
  echo "=== $cmd ===" && \
  grep -rn "$cmd" Makefile $MAKEFILE_DIR/ 2>/dev/null || echo "  ❌ NOT FOUND"
done
```

## Step 4 — Audit .json.tpl templates

```bash
# List all templates
find $IAM_TEMPLATES -name "*.json.tpl" | sort

# Read each template
for tpl in $(find $IAM_TEMPLATES -name "*.json.tpl" | sort); do
  echo "=== $(basename $tpl) ===" && cat "$tpl" && echo ""
done

# Extract all variable placeholders required
grep -roh '\${[A-Z_][A-Z0-9_]*}' $IAM_TEMPLATES/ | \
  awk -F: '{print $2}' | sort -u

# Check how templates are rendered in Makefiles
grep -rn "envsubst\|sed.*\.tpl\|\.json\.tpl" Makefile $MAKEFILE_DIR/ 2>/dev/null
```

## Step 5 — Validate OIDC trust template

For each template that defines an OIDC trust relationship, validate:

| Check | Expected value | Severity |
|---|---|---|
| Principal.Federated | `arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com` | 🔴 CRITICAL |
| Action | `sts:AssumeRoleWithWebIdentity` (not `sts:AssumeRole`) | 🔴 CRITICAL |
| Condition `aud` | `sts.amazonaws.com` | 🔴 CRITICAL |
| Condition `sub` | `repo:${GITHUB_ORG}/${GITHUB_REPO}:ref:refs/heads/${DEPLOY_BRANCH}` | 🔴 CRITICAL |
| `sub` uses StringLike (not StringEquals) | Required for branch pattern | 🟡 WARNING |
| No hardcoded account ID | Uses `${AWS_ACCOUNT_ID}` placeholder | 🟡 WARNING |

**Flag immediately as 🔴 CRITICAL if `sub` condition is:**
```
"repo:*:*"              ← any repo in any org
"repo:ORG/*:*"          ← any repo in org
"repo:ORG/REPO:*"       ← any branch/tag/PR (over-permissive)
```

## Step 6 — Validate Terraform policy template

For the policy template that grants Terraform execution permissions:

```bash
# Find the policy template
find $IAM_TEMPLATES -name "*policy*" -o -name "*terraform*" | grep "\.tpl"
```

**Least-privilege checklist — flag violations:**

| Check | Severity |
|---|---|
| `"Action": "*"` anywhere | 🔴 CRITICAL |
| `"Resource": "*"` on IAM actions | 🔴 CRITICAL |
| S3 actions scoped to `${TF_STATE_BUCKET}` ARN | 🟡 WARNING if `*` |
| DynamoDB actions scoped to lock table ARN | 🟡 WARNING if `*` |
| No `iam:CreateUser`, `iam:CreateAccessKey` | 🔴 CRITICAL if present |

## Step 7 — Document required env vars

```bash
# Collect all placeholders across all templates and Makefiles
echo "=== From templates ===" && \
  grep -roh '\${[A-Z_][A-Z0-9_]*}' $IAM_TEMPLATES/ | \
  awk -F: '{print $2}' | sort -u

echo "=== From Makefiles ===" && \
  grep -roh '\$([A-Z_][A-Z0-9_]*)' Makefile $MAKEFILE_DIR/ | \
  awk -F: '{print $2}' | tr -d '()' | sort -u | \
  grep -E "^[A-Z_]{3,}"
```

## Output — INFRA_PLAN.md Phase B section

```markdown
## Phase B: Makefile + IAM Template Findings

### Makefile completeness
| Target purpose | Found | Issue |
|---|---|---|
| OIDC provider creation | ✅/❌ | {detail} |
| Terraform role creation | ✅/❌ | {detail} |
| Policy attachment | ✅/❌ | {detail} |
| Verification | ✅/❌ | {detail} |

### Template security findings
| # | Severity | Template | Issue | Fix |
|---|---|---|---|---|
| 1 | 🔴 CRITICAL | oidc-trust.json.tpl | sub uses wildcard | Scope to repo+branch |

### Required env vars (must be set before running make targets)
| Variable | Used in | Description |
|---|---|---|
| `AWS_ACCOUNT_ID` | oidc-trust.json.tpl | 12-digit AWS account |
| `GITHUB_ORG` | oidc-trust.json.tpl | GitHub org name |
| `GITHUB_REPO` | oidc-trust.json.tpl | Repository name |
| `DEPLOY_BRANCH` | oidc-trust.json.tpl | Branch that triggers deploy |
| `TF_STATE_BUCKET` | terraform-policy.json.tpl | S3 bucket for TF state |
| `TF_LOCK_TABLE` | terraform-policy.json.tpl | DynamoDB lock table |

### Makefile execution order (admin only)
1. `make <oidc-target>` — create OIDC provider
2. `make <role-target>` — create Terraform role
3. `make <policy-target>` — attach policies
4. `make <verify-target>` — confirm setup
```
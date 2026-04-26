---
name: gha-debugger
description: >
  Diagnoses failing GitHub Actions workflows for ECS Fargate deployments.
  Uses gh CLI to fetch live run logs and combines with static YAML analysis
  to find root causes. Covers OIDC auth failures, ECR push errors, ECS deploy
  failures, Docker build errors, and missing secrets. Use when the user reports
  a failing CI/CD pipeline, workflow errors, or asks to debug GitHub Actions.
  Produces PIPELINE_DEBUG_REPORT.md with diffs — never modifies workflow files.
metadata:
  author: app-dev-exp
  version: "1.0"
---

# gha-debugger

Diagnoses GitHub Actions failures for ECS Fargate CI/CD pipelines. Output
is `PIPELINE_DEBUG_REPORT.md` with root cause + proposed fixes as diffs.
Paths resolved from `agents/shared/context/monorepo-paths.md`.

---

## Phase 1 — Load paths and fetch live run data

```bash
# Always read paths first
cat agents/shared/context/monorepo-paths.md
GHA_WORKFLOWS=".github/workflows"
PIPELINE_REPORTS=".github"

# List recent failed runs
gh run list --status failure --limit 10 \
  --json databaseId,name,headBranch,createdAt,conclusion \
  --jq '.[] | "\(.databaseId) \(.name) \(.headBranch) \(.createdAt)"'

# Get detailed view of latest failed run
gh run view <run-id> --log-failed 2>&1 | head -200

# If run-id unknown, get latest failure
LATEST_FAILED=$(gh run list --status failure --limit 1 --json databaseId --jq '.[0].databaseId')
gh run view $LATEST_FAILED --log-failed 2>&1

# Check which secrets are configured (names only, not values)
gh secret list
```

## Phase 2 — Static YAML analysis

```bash
# Find all workflow files
find $GHA_WORKFLOWS -name "*.yml" -o -name "*.yaml" | sort

# Read the failing workflow
cat $GHA_WORKFLOWS/<failing-workflow>.yml
```

## Phase 3 — Common failure patterns and diagnosis

### Pattern A: OIDC Authentication failure

**Symptoms in logs:**
```
Error: Credentials could not be loaded
Error: Could not load credentials from any providers
openid connect: unable to assume role
```

**Diagnosis checklist:**
```yaml
# Check these in the workflow:
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4  # must be v4+
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}   # must exist as secret
    aws-region: ${{ secrets.AWS_REGION }}
    role-session-name: GitHubActions-${{ github.run_id }}
```

```bash
# Verify secret exists
gh secret list | grep AWS_ROLE_ARN
gh secret list | grep AWS_REGION

# Verify workflow has correct permissions block
grep -A5 "permissions:" $GHA_WORKFLOWS/<workflow>.yml
```

Required permissions block:
```yaml
permissions:
  id-token: write   # REQUIRED for OIDC
  contents: read
```

**Common root causes:**
1. `permissions: id-token: write` missing → OIDC token not issued
2. `AWS_ROLE_ARN` secret not set → empty role ARN
3. OIDC trust policy `sub` condition too strict (branch mismatch)
4. Using `aws-actions/configure-aws-credentials@v1` (too old for OIDC)

---

### Pattern B: ECR Push failure

**Symptoms in logs:**
```
denied: User: arn:aws:sts::... is not authorized to perform: ecr:InitiateLayerUpload
Error response from daemon: Head ... no basic auth credentials
```

**Diagnosis:**
```bash
# Check ECR login step exists before docker push
grep -n "amazon-ecr-login\|ecr get-login" $GHA_WORKFLOWS/<workflow>.yml

# Check ECR repo name matches
grep -n "ECR_REPOSITORY\|ecr_repository" $GHA_WORKFLOWS/<workflow>.yml
```

Correct ECR login sequence:
```yaml
- name: Login to Amazon ECR
  id: login-ecr
  uses: aws-actions/amazon-ecr-login@v2

- name: Build and push image
  env:
    ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
    IMAGE_TAG: ${{ github.sha }}
  run: |
    docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
```

---

### Pattern C: ECS Deploy failure

**Symptoms in logs:**
```
Error: Service was unable to place a task
Error: Task stopped: CannotPullContainerError
Error: ResourceNotFoundException: TaskDefinition not found
```

**Diagnosis per error:**

`CannotPullContainerError` → ECS can't reach ECR
- ECS task in public subnet without ECR VPC endpoint? OR
- ECS execution role missing `ecr:GetAuthorizationToken`? OR
- NAT Gateway missing for private subnet?

```bash
# Check task definition step
grep -A20 "amazon-ecs-render-task-definition\|task-definition" \
  $GHA_WORKFLOWS/<workflow>.yml
```

Correct ECS deploy sequence:
```yaml
- name: Download task definition
  run: |
    aws ecs describe-task-definition \
      --task-definition ${{ env.ECS_TASK_DEFINITION }} \
      --query taskDefinition > task-definition.json

- name: Update ECS task definition with new image
  id: task-def
  uses: aws-actions/amazon-ecs-render-task-definition@v1
  with:
    task-definition: task-definition.json
    container-name: ${{ env.CONTAINER_NAME }}
    image: ${{ steps.build-image.outputs.image }}

- name: Deploy to ECS
  uses: aws-actions/amazon-ecs-deploy-task-definition@v2
  with:
    task-definition: ${{ steps.task-def.outputs.task-definition }}
    service: ${{ env.ECS_SERVICE }}
    cluster: ${{ env.ECS_CLUSTER }}
    wait-for-service-stability: true
```

---

### Pattern D: Missing environment variables / secrets

```bash
# Find all secrets/vars referenced in workflow
grep -oP '\$\{\{ secrets\.\K[^}]+' $GHA_WORKFLOWS/<workflow>.yml | sort -u
grep -oP '\$\{\{ vars\.\K[^}]+' $GHA_WORKFLOWS/<workflow>.yml | sort -u

# Compare against what's configured
echo "=== Configured secrets ==="
gh secret list --json name --jq '.[].name' | sort

echo "=== Referenced in workflow ==="
grep -oP '\$\{\{ secrets\.\K[^}]+' $GHA_WORKFLOWS/*.yml | \
  awk -F: '{print $2}' | sort -u
```

Any secret referenced but not listed → root cause.

---

## Phase 4 — Report generation

Generate `PIPELINE_DEBUG_REPORT.md`:

```markdown
# Pipeline Debug Report
Date: {date}
Workflow: {workflow file}
Run ID: {id}
Branch: {branch}

---

## Root Cause
{One clear sentence: what is actually broken}

## Evidence
\`\`\`
{relevant log lines — 5-10 lines max}
\`\`\`

## Contributing Factors
1. {factor}
2. {factor}

---

## Proposed Fix

### Fix 1: {title} — {file}
\`\`\`diff
- old line
+ new line
\`\`\`

### Fix 2: {title} — {file}
\`\`\`diff
- old line
+ new line
\`\`\`

---

## Secrets to add (if any)
| Secret name | Value source | How to add |
|---|---|---|
| AWS_ROLE_ARN | terraform output github_actions_role_arn | gh secret set AWS_ROLE_ARN |

⚠️ Do not add secrets via Claude — run gh secret set commands yourself
   or use the GitHub repository Settings → Secrets UI.

---

## Verification steps after applying fixes
1. {step}
2. {step}
```

## Output

Save report to `$PIPELINE_REPORTS/PIPELINE_DEBUG_REPORT.md`. Never apply diffs directly.
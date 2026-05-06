---
name: aws-live-auditor
description: >
  Verifies live AWS state for ECS Fargate + ECR + RDS + OIDC deployments using
  read-only AWS CLI commands. Checks cluster status, stopped task failure
  reasons, OIDC provider existence, and Terraform/GHA role presence. Never
  modifies AWS resources. Use after terraform-module-auditor and
  makefile-iam-auditor to cross-reference static findings against live state.
  Produces Phase C findings for INFRA_PLAN.md.
metadata:
  author: app-dev-exp
  version: "1.0"
---

# aws-live-auditor

**Input:** Live AWS account state via read-only AWS CLI
**Output:** Phase C (Live State) findings section in `INFRA_PLAN.md`
**Tools:** `aws` CLI — describe, list, get operations only
**Requires:** AWS CLI configured with read-only access

---

## Step 1 — Load paths

```bash
cat agents/shared/context/monorepo-paths.md
cat agents/shared/context/commit-conventions.md
TERRAFORM_AWS="cloud/terraform/aws"

# Derive cluster name from Terraform files
CLUSTER_NAME=$(grep -rh "cluster_name\|name.*=.*cluster" \
  $TERRAFORM_AWS --include="*.tf" | grep -oP '"[^"]+"' | head -1 | tr -d '"')
echo "Target cluster: $CLUSTER_NAME"
```

## Step 2 — OIDC provider

```bash
echo "=== OIDC Providers ===" && \
aws iam list-open-id-connect-providers \
  --query 'OpenIDConnectProviderList[*].Arn' --output table

# Verify GHA OIDC provider specifically
aws iam list-open-id-connect-providers \
  --query 'OpenIDConnectProviderList[?contains(Arn,`token.actions.githubusercontent.com`)].Arn' \
  --output text
# Empty output → 🔴 CRITICAL — OIDC provider missing, all GHA auth will fail
```

## Step 3 — Terraform / GHA roles

```bash
echo "=== Terraform/GHA Roles ===" && \
aws iam list-roles \
  --query 'Roles[?contains(RoleName,`terraform`) || contains(RoleName,`github`)].{Name:RoleName,Created:CreateDate,Arn:Arn}' \
  --output table

# If no roles found → 🔴 CRITICAL — Makefile targets have not been executed
```

## Step 4 — ECS cluster and service health

```bash
echo "=== ECS Cluster ===" && \
aws ecs describe-clusters --clusters $CLUSTER_NAME \
  --query 'clusters[0].{Status:status,Name:clusterName,RunningTasks:runningTasksCount,PendingTasks:pendingTasksCount}' \
  --output table

echo "=== ECS Services ===" && \
aws ecs list-services --cluster $CLUSTER_NAME --output text | \
  xargs -I{} aws ecs describe-services --cluster $CLUSTER_NAME --services {} \
  --query 'services[*].{Name:serviceName,Status:status,Running:runningCount,Desired:desiredCount,Pending:pendingCount}' \
  --output table
```

## Step 5 — Stopped task failure analysis

```bash
echo "=== Recently Stopped Tasks ===" && \
STOPPED_TASKS=$(aws ecs list-tasks \
  --cluster $CLUSTER_NAME \
  --desired-status STOPPED \
  --query 'taskArns[:10]' --output text)

if [ -n "$STOPPED_TASKS" ]; then
  aws ecs describe-tasks \
    --cluster $CLUSTER_NAME \
    --tasks $STOPPED_TASKS \
    --query 'tasks[*].{Status:lastStatus,Reason:stoppedReason,Container:containers[0].{Name:name,Exit:exitCode,Reason:reason}}' \
    --output json
fi
```

**Common `stoppedReason` patterns and their meaning:**

| Pattern | Root cause | Severity |
|---|---|---|
| `CannotPullContainerError` | ECR pull failed — execution role missing ECR perms OR no NAT Gateway | 🔴 CRITICAL |
| `ResourceInitializationError` | Secrets Manager/SSM fetch failed at startup — execution role perms | 🔴 CRITICAL |
| `Essential container exited` | App crash — check exit code and container reason | 🟡 WARNING |
| `Task failed ELB health checks` | App started but not responding on expected port | 🟡 WARNING |
| `CannotCreateContainerError` | Invalid task definition — CPU/memory mismatch | 🔴 CRITICAL |

## Step 6 — ECR repository health

```bash
echo "=== ECR Repositories ===" && \
aws ecr describe-repositories \
  --query 'repositories[*].{Name:repositoryName,URI:repositoryUri,ScanOnPush:imageScanningConfiguration.scanOnPush}' \
  --output table

# Check latest image exists and is not stale (> 30 days)
aws ecr describe-images \
  --repository-name <repo-name> \
  --query 'sort_by(imageDetails,&imagePushedAt)[-1].{Tag:imageTags[0],Pushed:imagePushedAt,Size:imageSizeInBytes}' \
  --output table
```

## Step 7 — RDS reachability

```bash
echo "=== RDS Instances ===" && \
aws rds describe-db-instances \
  --query 'DBInstances[*].{ID:DBInstanceIdentifier,Status:DBInstanceStatus,Public:PubliclyAccessible,Endpoint:Endpoint.Address}' \
  --output table

# PubliclyAccessible: true → 🔴 CRITICAL
# Status not "available" → 🟡 WARNING
```

## Output — INFRA_PLAN.md Phase C section

```markdown
## Phase C: Live AWS State Findings

### OIDC Provider
| Check | Status | Detail |
|---|---|---|
| GHA OIDC provider exists | ✅/❌ | {ARN or MISSING} |

### IAM Roles
| Role | Exists | Created |
|---|---|---|
| Terraform pipeline role | ✅/❌ | {date or NOT FOUND} |

### ECS Health
| Check | Status | Detail |
|---|---|---|
| Cluster active | ✅/❌ | {status} |
| Services running | ✅/❌ | {running/desired} |
| Stopped tasks found | ✅/⚠️ | {count and reasons} |

### RDS Health
| Check | Status | Detail |
|---|---|---|
| Instance available | ✅/❌ | {status} |
| Not publicly accessible | ✅/❌ | {value} |

### Cross-reference with static findings
{Note any discrepancy between what .tf files define and what AWS shows}
```
---
name: iam-template-validator
description: >
  Cross-validates .json.tpl templates in cloud/terraform/aws/iam/ against live
  IAM roles created by the Makefile in AWS. Detects drift between what the
  templates define and what actually exists — indicates Makefile was not re-run
  after a template change. Also validates Terraform-created ECS roles against
  .tf definitions. Never modifies IAM resources. Use after makefile-iam-auditor
  and aws-live-auditor. Produces Phase D findings for INFRA_PLAN.md.
metadata:
  author: app-dev-exp
  version: "1.0"
---

# iam-template-validator

**Input:** `cloud/terraform/aws/iam/*.json.tpl` + live AWS IAM via CLI
**Output:** Phase D (IAM Drift) findings section in `INFRA_PLAN.md`
**Tools:** `cat`, `grep`, `aws iam get-role`, `aws iam get-role-policy`

---

## Step 1 — Load paths

```bash
cat agents/shared/context/monorepo-paths.md
cat agents/shared/context/commit-conventions.md
IAM_TEMPLATES="cloud/terraform/aws/iam"
TERRAFORM_AWS="cloud/terraform/aws"
```

## Step 2 — Identify roles to validate

```bash
# Makefile-created roles (from templates)
TERRAFORM_ROLE=$(aws iam list-roles \
  --query 'Roles[?contains(RoleName,`terraform`) || contains(RoleName,`github`)].RoleName' \
  --output text | head -1)
echo "Terraform pipeline role: $TERRAFORM_ROLE"

# Terraform-created ECS roles (from task definition)
TASK_DEF=$(aws ecs list-task-definitions --sort DESC \
  --query 'taskDefinitionArns[0]' --output text | awk -F'/' '{print $NF}')
EXEC_ROLE=$(aws ecs describe-task-definition --task-definition $TASK_DEF \
  --query 'taskDefinition.executionRoleArn' --output text | awk -F'/' '{print $NF}')
TASK_ROLE=$(aws ecs describe-task-definition --task-definition $TASK_DEF \
  --query 'taskDefinition.taskRoleArn' --output text | awk -F'/' '{print $NF}')

echo "Execution role: $EXEC_ROLE"
echo "Task role: $TASK_ROLE"
```

## Step 3 — Cross-check OIDC trust template vs live role

```bash
# Extract actions and conditions from trust template
echo "=== Template trust policy ===" && \
  find $IAM_TEMPLATES -name "*trust*" -o -name "*oidc*" | \
  grep "\.tpl" | head -1 | xargs cat

# Extract live trust policy from AWS
echo "=== Live trust policy ===" && \
aws iam get-role --role-name $TERRAFORM_ROLE \
  --query 'Role.AssumeRolePolicyDocument' --output json
```

**Compare these fields between template and live:**

```bash
# Template conditions (rendered)
grep -oP '"token\.actions\.githubusercontent\.com:(aud|sub)":\s*"[^"]+"' \
  $IAM_TEMPLATES/*.json.tpl 2>/dev/null

# Live conditions
aws iam get-role --role-name $TERRAFORM_ROLE \
  --query 'Role.AssumeRolePolicyDocument.Statement[0].Condition' \
  --output json
```

Flag drift if:
- `sub` value in template differs from live → 🟡 WARNING — template updated, make not re-run
- `aud` changed → 🔴 CRITICAL — OIDC auth will fail

## Step 4 — Cross-check Terraform policy template vs live inline policies

```bash
# Actions defined in policy template
echo "=== Template policy actions ===" && \
find $IAM_TEMPLATES -name "*policy*" -o -name "*permission*" | \
  grep "\.tpl" | xargs grep -oh '"[a-z]*:[A-Za-z*]*"' 2>/dev/null | sort -u

# Actions in live inline policies
echo "=== Live inline policy actions ===" && \
for policy in $(aws iam list-role-policies --role-name $TERRAFORM_ROLE \
  --query 'PolicyNames' --output text); do
  aws iam get-role-policy \
    --role-name $TERRAFORM_ROLE \
    --policy-name $policy \
    --query 'PolicyDocument.Statement[*].{Actions:Action,Resources:Resource}' \
    --output json
done
```

## Step 5 — Validate ECS role trust relationships

```bash
for role in $EXEC_ROLE $TASK_ROLE; do
  echo "=== Trust: $role ===" && \
  aws iam get-role --role-name $role \
    --query 'Role.AssumeRolePolicyDocument.Statement[*].{Principal:Principal.Service,Action:Action}' \
    --output json
done
```

**Both ECS roles must have:**
```json
{
  "Principal": { "Service": "ecs-tasks.amazonaws.com" },
  "Action": "sts:AssumeRole"
}
```

Violations:
- `ec2.amazonaws.com` instead of `ecs-tasks.amazonaws.com` → 🔴 CRITICAL
- `sts:AssumeRoleWithWebIdentity` on ECS roles → 🔴 CRITICAL (wrong action type)

## Step 6 — Validate ECS role permissions vs .tf definitions

```bash
# What .tf files declare for execution role
grep -A 30 "aws_iam_role_policy\|aws_iam_policy_document" \
  $TERRAFORM_AWS --include="*.tf" -r | grep -A 5 "execution\|exec"

# What exists live for execution role
aws iam list-attached-role-policies --role-name $EXEC_ROLE --output table
aws iam list-role-policies --role-name $EXEC_ROLE --output table

# Same for task role
aws iam list-attached-role-policies --role-name $TASK_ROLE --output table
aws iam list-role-policies --role-name $TASK_ROLE --output table
```

## Output — INFRA_PLAN.md Phase D section

```markdown
## Phase D: IAM Drift Findings

### Terraform Pipeline Role (Makefile-managed)
| Check | Template | Live AWS | Drift |
|---|---|---|---|
| OIDC sub condition | repo:ORG/REPO:ref:... | repo:ORG/REPO:* | ⚠️ Template more restrictive — re-run make |
| Policy action s3:PutObject | ✅ present | ✅ present | None |

### ECS Execution Role (Terraform-managed)
| Check | .tf definition | Live AWS | Drift |
|---|---|---|---|
| Trust principal | ecs-tasks.amazonaws.com | ecs-tasks.amazonaws.com | None |
| ecr:BatchGetImage | ✅ | ✅ | None |

### ECS Task Role (Terraform-managed)
| Check | .tf definition | Live AWS | Drift |
|---|---|---|---|
| ssm:GetParameter | ✅ | ❌ missing | 🔴 terraform apply needed |

### Actions required to resolve drift
- Re-run `make <target>` to sync Terraform pipeline role with updated template
- Run `terraform apply` to add missing task role permissions
```
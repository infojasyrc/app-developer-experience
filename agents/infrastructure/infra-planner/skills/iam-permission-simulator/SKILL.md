---
name: iam-permission-simulator
metadata:
  author: app-dev-exp
  version: "1.0"
description: >
  Simulates IAM permissions for all three roles in the ECS Fargate + GitHub
  Actions OIDC stack using aws iam simulate-principal-policy. Covers the
  Terraform pipeline role (GHA OIDC), ECS execution role, and ECS task role.
  Produces a definitive ALLOW/DENY matrix confirming which permissions are
  actually granted. Use as the final validation step before infra-developer
  implements fixes. Never modifies IAM resources. Produces Phase E findings
  for INFRA_PLAN.md.
---

# iam-permission-simulator

**Input:** Live AWS IAM roles identified by `iam-template-validator`
**Output:** Phase E (Permission Simulation) findings in `INFRA_PLAN.md`
**Tools:** `aws iam simulate-principal-policy` — read-only simulation
**Requires:** Run after `iam-template-validator` — needs role names from Phase D

---

## Step 1 — Load paths and role names

```bash
cat agents/shared/context/monorepo-paths.md
cat agents/shared/context/commit-conventions.md

# Set role names (from iam-template-validator output)
TERRAFORM_ROLE="<name-from-phase-d>"
EXEC_ROLE="<name-from-phase-d>"
TASK_ROLE="<name-from-phase-d>"

# Get role ARNs
TERRAFORM_ROLE_ARN=$(aws iam get-role --role-name $TERRAFORM_ROLE \
  --query 'Role.Arn' --output text)
EXEC_ROLE_ARN=$(aws iam get-role --role-name $EXEC_ROLE \
  --query 'Role.Arn' --output text)
TASK_ROLE_ARN=$(aws iam get-role --role-name $TASK_ROLE \
  --query 'Role.Arn' --output text)

# Get account and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)
```

## Step 2 — Simulate Terraform pipeline role

```bash
echo "=== Terraform Pipeline Role Simulation ==="
aws iam simulate-principal-policy \
  --policy-source-arn $TERRAFORM_ROLE_ARN \
  --action-names \
    "s3:GetObject" \
    "s3:PutObject" \
    "s3:ListBucket" \
    "dynamodb:GetItem" \
    "dynamodb:PutItem" \
    "dynamodb:DeleteItem" \
    "ecs:RegisterTaskDefinition" \
    "ecs:UpdateService" \
    "ecs:DescribeServices" \
    "ecs:DescribeTaskDefinition" \
    "ecr:GetAuthorizationToken" \
    "ecr:BatchGetImage" \
    "ecr:PutImage" \
    "iam:PassRole" \
    "logs:CreateLogGroup" \
    "secretsmanager:GetSecretValue" \
    "ssm:GetParameter" \
  --resource-arns \
    "arn:aws:s3:::<tf-state-bucket>" \
    "arn:aws:s3:::<tf-state-bucket>/*" \
    "arn:aws:dynamodb:$AWS_REGION:$AWS_ACCOUNT_ID:table/<lock-table>" \
    "arn:aws:ecs:$AWS_REGION:$AWS_ACCOUNT_ID:service/*/*" \
    "arn:aws:ecr:$AWS_REGION:$AWS_ACCOUNT_ID:repository/*" \
  --query 'EvaluationResults[*].{Action:EvalActionName,Decision:EvalDecision}' \
  --output table
```

## Step 3 — Simulate ECS execution role

```bash
echo "=== ECS Execution Role Simulation ==="
aws iam simulate-principal-policy \
  --policy-source-arn $EXEC_ROLE_ARN \
  --action-names \
    "ecr:GetAuthorizationToken" \
    "ecr:BatchCheckLayerAvailability" \
    "ecr:GetDownloadUrlForLayer" \
    "ecr:BatchGetImage" \
    "logs:CreateLogStream" \
    "logs:PutLogEvents" \
    "logs:CreateLogGroup" \
    "secretsmanager:GetSecretValue" \
    "ssm:GetParameters" \
    "kms:Decrypt" \
  --resource-arns \
    "*" \
    "arn:aws:logs:$AWS_REGION:$AWS_ACCOUNT_ID:log-group:/ecs/*" \
    "arn:aws:secretsmanager:$AWS_REGION:$AWS_ACCOUNT_ID:secret:*" \
    "arn:aws:ssm:$AWS_REGION:$AWS_ACCOUNT_ID:parameter/*" \
  --query 'EvaluationResults[*].{Action:EvalActionName,Decision:EvalDecision}' \
  --output table
```

## Step 4 — Simulate ECS task role

```bash
echo "=== ECS Task Role Simulation ==="
aws iam simulate-principal-policy \
  --policy-source-arn $TASK_ROLE_ARN \
  --action-names \
    "ssm:GetParameter" \
    "ssm:GetParameters" \
    "ssm:GetParametersByPath" \
    "secretsmanager:GetSecretValue" \
    "logs:CreateLogStream" \
    "logs:PutLogEvents" \
  --resource-arns \
    "arn:aws:ssm:$AWS_REGION:$AWS_ACCOUNT_ID:parameter/<app-prefix>/*" \
    "arn:aws:secretsmanager:$AWS_REGION:$AWS_ACCOUNT_ID:secret:<app-name>*" \
    "arn:aws:logs:$AWS_REGION:$AWS_ACCOUNT_ID:log-group:/ecs/*:*" \
  --query 'EvaluationResults[*].{Action:EvalActionName,Decision:EvalDecision,Resource:EvalResourceName}' \
  --output table
```

## Step 5 — Classify results

For each `DENY` or `IMPLICIT_DENY` result:

| Decision | Meaning | Severity |
|---|---|---|
| `ALLOW` | Permission granted | ✅ |
| `IMPLICIT_DENY` | No policy grants this — add permission | 🔴 CRITICAL |
| `EXPLICIT_DENY` | Deny policy overrides allow — find and remove SCP/boundary | 🔴 CRITICAL |

## Output — INFRA_PLAN.md Phase E section

```markdown
## Phase E: Permission Simulation Results

### Terraform Pipeline Role
| Action | Decision | Fix |
|---|---|---|
| s3:PutObject | ✅ ALLOW | — |
| iam:PassRole | ❌ IMPLICIT_DENY | Add iam:PassRole to policy template |
| ecs:UpdateService | ✅ ALLOW | — |

### ECS Execution Role
| Action | Decision | Fix |
|---|---|---|
| ecr:GetAuthorizationToken | ✅ ALLOW | — |
| secretsmanager:GetSecretValue | ❌ IMPLICIT_DENY | Add to execution role .tf |

### ECS Task Role
| Action | Decision | Fix |
|---|---|---|
| ssm:GetParameter | ❌ IMPLICIT_DENY | Add SSM policy to task role .tf |
| secretsmanager:GetSecretValue | ✅ ALLOW | — |

### Summary
- 🔴 CRITICAL denials: N — must fix before deployment
- 🟡 WARNING: M — review before prod

### Handoff to infra-developer
Pass this Phase E section to infra-developer as the authoritative list of
permissions to add. infra-developer uses iam-roles-ecs skill to implement.
```
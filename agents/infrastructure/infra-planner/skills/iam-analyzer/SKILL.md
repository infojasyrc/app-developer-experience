---
name: iam-analyzer
description: >
  Diagnoses IAM roles, policies, and trust relationships for ECS Fargate
  deployments. Focuses on permissions between ECS tasks and AWS services:
  RDS (via Secrets Manager), SSM Parameter Store, ECR pull, and CloudWatch
  Logs. Use when the user reports permission errors in ECS, tasks failing to
  start, or containers unable to reach AWS services. Produces IAM findings
  for INFRA_PLAN.md. Never modifies IAM resources.
---

# iam-analyzer

Diagnoses IAM permission gaps for ECS Fargate → RDS / SSM / Secrets Manager /
ECR. Read-only analysis only.

---

## The two ECS IAM roles — always check both

```
ECS Task Execution Role          ECS Task Role
─────────────────────────────    ──────────────────────────────
Used BY: ECS control plane       Used BY: your application code
For: pulling ECR image           For: calling AWS APIs at runtime
    writing CloudWatch logs           reading SSM parameters
    reading Secrets Manager           accessing Secrets Manager
    (for task definition secrets)     querying RDS via IAM auth
```

**Common mistake:** putting application permissions on the Execution Role
instead of the Task Role — or vice versa.

---

## Phase 1 — Discover existing IAM config in Terraform

```bash
# Find role definitions
grep -rn "aws_iam_role\|aws_iam_role_policy\|aws_iam_policy\|aws_iam_role_policy_attachment" \
  cloud/terraform --include="*.tf" -l

# Find execution role reference in task definition
grep -rn "execution_role_arn\|task_role_arn" cloud/terraform --include="*.tf"

# Extract role names
grep -rn "\"execution_role_arn\"\|\"task_role_arn\"" \
  cloud/terraform --include="*.tf"
```

## Phase 2 — Validate Execution Role

The execution role **must** have these permissions:

```json
{
  "Effect": "Allow",
  "Action": [
    "ecr:GetAuthorizationToken",
    "ecr:BatchCheckLayerAvailability",
    "ecr:GetDownloadUrlForLayer",
    "ecr:BatchGetImage",
    "logs:CreateLogStream",
    "logs:PutLogEvents",
    "logs:CreateLogGroup"
  ],
  "Resource": "*"
}
```

If task definition uses `secrets` block (pulling from Secrets Manager):
```json
{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:GetSecretValue",
    "ssm:GetParameters",
    "kms:Decrypt"
  ],
  "Resource": [
    "arn:aws:secretsmanager:<region>:<account>:secret:<secret-name>*",
    "arn:aws:ssm:<region>:<account>:parameter/<param-path>*"
  ]
}
```

Check via AWS CLI:
```bash
# Get execution role name from Terraform output or state
EXEC_ROLE=$(aws ecs describe-task-definition \
  --task-definition <task-def-name> \
  --query 'taskDefinition.executionRoleArn' --output text \
  | awk -F'/' '{print $NF}')

# List attached policies
aws iam list-attached-role-policies --role-name $EXEC_ROLE
aws iam list-role-policies --role-name $EXEC_ROLE

# Simulate a specific permission
aws iam simulate-principal-policy \
  --policy-source-arn "arn:aws:iam::<account>:role/$EXEC_ROLE" \
  --action-names "ecr:GetAuthorizationToken" "logs:PutLogEvents" \
  --query 'EvaluationResults[*].{Action:EvalActionName,Decision:EvalDecision}'
```

## Phase 3 — Validate Task Role (application permissions)

The task role must have permissions for what your app does at runtime:

**SSM Parameter Store:**
```json
{
  "Effect": "Allow",
  "Action": ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParametersByPath"],
  "Resource": "arn:aws:ssm:<region>:<account>:parameter/<app-prefix>/*"
}
```

**Secrets Manager (runtime access):**
```json
{
  "Effect": "Allow",
  "Action": ["secretsmanager:GetSecretValue"],
  "Resource": "arn:aws:secretsmanager:<region>:<account>:secret:<secret-name>*"
}
```

**RDS IAM Authentication (if used instead of password):**
```json
{
  "Effect": "Allow",
  "Action": ["rds-db:connect"],
  "Resource": "arn:aws:rds-db:<region>:<account>:dbuser/<db-resource-id>/<db-username>"
}
```

**CloudWatch Logs (application logging):**
```json
{
  "Effect": "Allow",
  "Action": ["logs:CreateLogStream", "logs:PutLogEvents"],
  "Resource": "arn:aws:logs:<region>:<account>:log-group:/ecs/<app-name>:*"
}
```

## Phase 4 — Validate Trust Relationships

Both roles must trust ECS:

```bash
# Check trust policy
aws iam get-role --role-name <role-name> \
  --query 'Role.AssumeRolePolicyDocument'
```

Expected trust policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ecs-tasks.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
```

**Common mistake:** trust policy references `ec2.amazonaws.com` instead of
`ecs-tasks.amazonaws.com` — role exists but ECS cannot assume it.

## Phase 5 — GitHub Actions OIDC role (if using OIDC)

```bash
# Check for OIDC provider
aws iam list-open-id-connect-providers

# Check GHA deployment role trust policy
aws iam get-role --role-name <gha-deploy-role> \
  --query 'Role.AssumeRolePolicyDocument'
```

Expected OIDC trust for GitHub Actions:
```json
{
  "Principal": {
    "Federated": "arn:aws:iam::<account>:oidc-provider/token.actions.githubusercontent.com"
  },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
    },
    "StringLike": {
      "token.actions.githubusercontent.com:sub": "repo:<org>/<repo>:*"
    }
  }
}
```

## Phase 6 — Simulate and confirm gaps

```bash
# Simulate the task role against the specific actions your app needs
aws iam simulate-principal-policy \
  --policy-source-arn "arn:aws:iam::<account>:role/<task-role>" \
  --action-names \
    "ssm:GetParameter" \
    "secretsmanager:GetSecretValue" \
    "logs:PutLogEvents" \
  --resource-arns \
    "arn:aws:ssm:<region>:<account>:parameter/<prefix>/*" \
    "arn:aws:secretsmanager:<region>:<account>:secret:<name>*" \
  --query 'EvaluationResults[*].{Action:EvalActionName,Decision:EvalDecision,Resource:EvalResourceName}'
```

Any `DENY` or `IMPLICIT_DENY` result → critical finding for the plan.

## Output format for INFRA_PLAN.md (Phase B section)

```markdown
## Phase B: IAM Remediation

### Execution Role gaps
| Permission | Status | Fix |
|---|---|---|
| ecr:GetAuthorizationToken | ✅ Present | — |
| secretsmanager:GetSecretValue (exec) | ❌ Missing | Add to execution role policy |

### Task Role gaps
| Permission | Status | Fix |
|---|---|---|
| ssm:GetParameter | ❌ Missing | Add SSM policy to task role |
| rds-db:connect | ⚠️ NEEDS HUMAN REVIEW | Confirm if using IAM auth or password |

### Trust relationship issues
{List any trust policy problems}

### Terraform resources to create/modify
{List specific aws_iam_role_policy or aws_iam_policy resources}
```
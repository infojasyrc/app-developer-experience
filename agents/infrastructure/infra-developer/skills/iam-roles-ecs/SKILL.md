---
name: iam-roles-ecs
description: >
  Creates and fixes IAM roles and policies for ECS Fargate deployments:
  task execution role (ECR pull, CloudWatch, Secrets Manager at startup),
  task role (SSM, Secrets Manager at runtime, RDS IAM auth, CloudWatch),
  and GitHub Actions OIDC role for CI/CD deployments. Use when the plan
  identifies IAM permission gaps. Always uses least-privilege — never
  AdministratorAccess or wildcard resources. Requires Phase A complete.
---

# iam-roles-ecs

Implements Phase B of `INFRA_PLAN.md`: IAM roles and policies for ECS Fargate.
Writes directly into `infrastructure/terraform/modules/iam/`.

---

## Before writing any file

```bash
cat infrastructure/INFRA_PLAN.md  # read Phase B section
grep -rn "execution_role_arn\|task_role_arn" infrastructure/ --include="*.tf"
terraform validate
```

---

## ECS Task Execution Role

```hcl
# modules/iam/ecs_execution_role.tf

data "aws_iam_policy_document" "ecs_execution_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_execution" {
  name               = "${var.app_name}-ecs-execution-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.ecs_execution_assume.json
  tags               = var.common_tags
}

# Base execution permissions (ECR + CloudWatch)
resource "aws_iam_role_policy_attachment" "ecs_execution_managed" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Secrets at startup (task definition secrets block)
data "aws_iam_policy_document" "ecs_execution_secrets" {
  statement {
    sid    = "SecretsManagerAccess"
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
    ]
    resources = [
      "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:${var.app_name}/${var.environment}/*"
    ]
  }

  statement {
    sid    = "SSMParameterAccess"
    effect = "Allow"
    actions = [
      "ssm:GetParameters",
      "ssm:GetParameter",
    ]
    resources = [
      "arn:aws:ssm:${var.aws_region}:${var.aws_account_id}:parameter/${var.app_name}/${var.environment}/*"
    ]
  }

  statement {
    sid    = "KMSDecrypt"
    effect = "Allow"
    actions = ["kms:Decrypt"]
    resources = [var.kms_key_arn]  # scope to your KMS key ARN
  }
}

resource "aws_iam_role_policy" "ecs_execution_secrets" {
  name   = "secrets-access"
  role   = aws_iam_role.ecs_execution.id
  policy = data.aws_iam_policy_document.ecs_execution_secrets.json
}
```

## ECS Task Role (application runtime permissions)

```hcl
# modules/iam/ecs_task_role.tf

data "aws_iam_policy_document" "ecs_task_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task" {
  name               = "${var.app_name}-ecs-task-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json
  tags               = var.common_tags
}

# SSM Parameter Store — runtime config reads
data "aws_iam_policy_document" "ecs_task_ssm" {
  statement {
    sid    = "SSMParameterRead"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath",
    ]
    resources = [
      "arn:aws:ssm:${var.aws_region}:${var.aws_account_id}:parameter/${var.app_name}/${var.environment}/*"
    ]
  }
}

# Secrets Manager — runtime secret reads
data "aws_iam_policy_document" "ecs_task_secrets" {
  statement {
    sid     = "SecretsManagerRead"
    effect  = "Allow"
    actions = ["secretsmanager:GetSecretValue"]
    resources = [
      "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:${var.app_name}/${var.environment}/*"
    ]
  }
}

# CloudWatch Logs — application logging
data "aws_iam_policy_document" "ecs_task_logs" {
  statement {
    sid    = "CloudWatchLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [
      "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/ecs/${var.app_name}-${var.environment}:*"
    ]
  }
}

resource "aws_iam_role_policy" "ecs_task_ssm" {
  name   = "ssm-read"
  role   = aws_iam_role.ecs_task.id
  policy = data.aws_iam_policy_document.ecs_task_ssm.json
}

resource "aws_iam_role_policy" "ecs_task_secrets" {
  name   = "secrets-read"
  role   = aws_iam_role.ecs_task.id
  policy = data.aws_iam_policy_document.ecs_task_secrets.json
}

resource "aws_iam_role_policy" "ecs_task_logs" {
  name   = "cloudwatch-logs"
  role   = aws_iam_role.ecs_task.id
  policy = data.aws_iam_policy_document.ecs_task_logs.json
}
```

## GitHub Actions OIDC Role (CI/CD deployments without static keys)

```hcl
# modules/iam/github_actions_role.tf

data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

# Create OIDC provider if it doesn't exist
resource "aws_iam_openid_connect_provider" "github" {
  count = var.create_github_oidc_provider ? 1 : 0

  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

data "aws_iam_policy_document" "github_actions_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      # Scope to your repo and branch — never use wildcard org
      values   = ["repo:${var.github_org}/${var.github_repo}:ref:refs/heads/${var.deploy_branch}"]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name               = "${var.app_name}-github-actions-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.github_actions_assume.json
  tags               = var.common_tags
}

# Permissions GHA needs for CI/CD
data "aws_iam_policy_document" "github_actions_deploy" {
  statement {
    sid    = "ECRAuth"
    effect = "Allow"
    actions = ["ecr:GetAuthorizationToken"]
    resources = ["*"]  # GetAuthorizationToken requires *
  }

  statement {
    sid    = "ECRPush"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage",
    ]
    resources = [
      "arn:aws:ecr:${var.aws_region}:${var.aws_account_id}:repository/${var.app_name}-${var.environment}"
    ]
  }

  statement {
    sid    = "ECSDeployment"
    effect = "Allow"
    actions = [
      "ecs:UpdateService",
      "ecs:DescribeServices",
      "ecs:DescribeTaskDefinition",
      "ecs:RegisterTaskDefinition",
    ]
    resources = [
      "arn:aws:ecs:${var.aws_region}:${var.aws_account_id}:service/${var.app_name}-${var.environment}/${var.app_name}-${var.environment}",
      "arn:aws:ecs:${var.aws_region}:${var.aws_account_id}:task-definition/${var.app_name}-${var.environment}:*",
    ]
  }

  statement {
    sid    = "PassRolesToECS"
    effect = "Allow"
    actions = ["iam:PassRole"]
    resources = [
      aws_iam_role.ecs_execution.arn,
      aws_iam_role.ecs_task.arn,
    ]
  }
}

resource "aws_iam_role_policy" "github_actions_deploy" {
  name   = "ecs-deploy"
  role   = aws_iam_role.github_actions.id
  policy = data.aws_iam_policy_document.github_actions_deploy.json
}

output "github_actions_role_arn" {
  description = "ARN to set as AWS_ROLE_ARN in GitHub repository secrets"
  value       = aws_iam_role.github_actions.arn
}
```

## Verification

```bash
cd infrastructure/terraform
terraform validate
terraform plan -var-file="environments/${var.environment}.tfvars" 2>&1 | \
  grep -E "will be created|will be updated|will be destroyed|Error"

# After plan looks correct — simulate permissions (never apply yet)
aws iam simulate-principal-policy \
  --policy-source-arn $(terraform output -raw github_actions_role_arn) \
  --action-names "ecr:PutImage" "ecs:UpdateService" "iam:PassRole" \
  --query 'EvaluationResults[*].{Action:EvalActionName,Decision:EvalDecision}'
```

## Completion report format

```
✅ Phase B Complete — IAM Roles

Created:
- modules/iam/ecs_execution_role.tf  (execution role + secrets access)
- modules/iam/ecs_task_role.tf       (task role: SSM + Secrets + Logs)
- modules/iam/github_actions_role.tf (OIDC role for GHA)

terraform validate: ✅
terraform plan: ✅ 8 to add, 0 to change, 0 to destroy

Output: github_actions_role_arn = arn:aws:iam::<account>:role/...
→ Add this ARN as AWS_ROLE_ARN secret in GitHub repository settings
```
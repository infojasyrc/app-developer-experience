# Inline policy attachments for Makefile-managed ECS roles.
#
# These roles were created via the bootstrap Makefile but are missing their
# custom inline policies. This file attaches the missing permissions that were
# defined in task-execution-policy.json.tpl and task-role-policy.json.tpl.
#
# Provider: aws.ecs — appdevexp-ecs-deploy-role has iam:PutRolePolicy for
# appdevexp-* roles. Pre-requisite: both roles must have the
# appdevexp-permissions-boundary attached (see INFRA_PLAN.md unplanned finding).

# ── Reference existing Makefile-managed roles ───────────────────────────────

data "aws_iam_role" "task_execution" {
  provider = aws.ecs
  name     = "appdevexp-task-execution-role"
}

data "aws_iam_role" "task_role" {
  provider = aws.ecs
  name     = "appdevexp-${var.application_name}-task-role"
}

# ── ECS Task Execution Role — missing inline policies ───────────────────────
# Mirrors task-execution-policy.json.tpl (SSM + Secrets Manager + KMS blocks).
# ECR and CloudWatch write are already covered by AmazonECSTaskExecutionRolePolicy.

data "aws_iam_policy_document" "task_execution_extras" {
  statement {
    sid    = "SSMSecretsAccess"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath",
    ]
    resources = [
      "arn:aws:ssm:${var.aws_account_region}:${var.aws_account_id}:parameter/appdevexp/*",
    ]
  }

  statement {
    sid    = "SecretsManagerAccess"
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
    ]
    resources = [
      "arn:aws:secretsmanager:${var.aws_account_region}:${var.aws_account_id}:secret:appdevexp/*",
    ]
  }

  statement {
    sid    = "KMSDecryptForSecrets"
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
    ]
    resources = [
      "arn:aws:kms:${var.aws_account_region}:${var.aws_account_id}:key/*",
    ]
    condition {
      test     = "StringLike"
      variable = "kms:ViaService"
      values = [
        "ssm.${var.aws_account_region}.amazonaws.com",
        "secretsmanager.${var.aws_account_region}.amazonaws.com",
        "logs.${var.aws_account_region}.amazonaws.com",
      ]
    }
  }
}

resource "aws_iam_role_policy" "task_execution_extras" {
  provider = aws.ecs
  name     = "task-execution-extras"
  role     = data.aws_iam_role.task_execution.name
  policy   = data.aws_iam_policy_document.task_execution_extras.json
}

# ── ECS Task Role — missing inline policies ─────────────────────────────────
# Mirrors task-role-policy.json.tpl (SSM + S3 + CloudWatch Metrics + Logs).
# XRay is already allowed (detected in Phase E simulation).

data "aws_iam_policy_document" "task_role_ssm" {
  statement {
    sid    = "SSMParameterReadOnly"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath",
    ]
    resources = [
      "arn:aws:ssm:${var.aws_account_region}:${var.aws_account_id}:parameter/appdevexp/${var.application_name}/*",
    ]
  }
}

data "aws_iam_policy_document" "task_role_s3" {
  statement {
    sid    = "S3AppBucketAccess"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = [
      "arn:aws:s3:::appdevexp-${var.application_name}-*",
      "arn:aws:s3:::appdevexp-${var.application_name}-*/*",
    ]
  }
}

data "aws_iam_policy_document" "task_role_cloudwatch" {
  statement {
    sid    = "CloudWatchMetrics"
    effect = "Allow"
    actions = [
      "cloudwatch:PutMetricData",
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "cloudwatch:namespace"
      values   = ["appdevexp/${var.application_name}"]
    }
  }

  statement {
    sid    = "CloudWatchLogsWrite"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [
      "arn:aws:logs:${var.aws_account_region}:${var.aws_account_id}:log-group:/ecs/${var.application_name}-${local.environment}:*",
    ]
  }
}

resource "aws_iam_role_policy" "task_role_ssm" {
  provider = aws.ecs
  name     = "ssm-read"
  role     = data.aws_iam_role.task_role.name
  policy   = data.aws_iam_policy_document.task_role_ssm.json
}

resource "aws_iam_role_policy" "task_role_s3" {
  provider = aws.ecs
  name     = "s3-app-bucket"
  role     = data.aws_iam_role.task_role.name
  policy   = data.aws_iam_policy_document.task_role_s3.json
}

resource "aws_iam_role_policy" "task_role_cloudwatch" {
  provider = aws.ecs
  name     = "cloudwatch-logs-metrics"
  role     = data.aws_iam_role.task_role.name
  policy   = data.aws_iam_policy_document.task_role_cloudwatch.json
}

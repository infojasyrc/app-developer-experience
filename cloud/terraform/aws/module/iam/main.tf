# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# Role for ECS Execution Task
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

data "aws_iam_policy" "ecs_service_policy" {
  arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_service_role" {
  name               = "${var.application_name}-ecs-role-manager"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "ecs_service_role_policy_attach" {
  role       = aws_iam_role.ecs_service_role.name
  policy_arn = data.aws_iam_policy.ecs_service_policy.arn
}

data "aws_iam_policy_document" "ecs_service_scaling" {
  statement {
    effect = "Allow"

    actions = [
      "application-autoscaling:*",
      "ecs:DescribeServices",
      "ecs:UpdateService",
      "cloudwatch:DescribeAlarms",
      "cloudwatch:PutMetricAlarm",
      "cloudwatch:DeleteAlarms",
      "cloudwatch:DescribeAlarmHistory",
      "cloudwatch:DescribeAlarms",
      "cloudwatch:DescribeAlarmsForMetric",
      "cloudwatch:GetMetricStatistics",
      "cloudwatch:ListMetrics",
      "cloudwatch:PutMetricAlarm",
      "cloudwatch:DisableAlarmActions",
      "cloudwatch:EnableAlarmActions",
      "iam:CreateServiceLinkedRole",
      "sns:CreateTopic",
      "sns:Subscribe",
      "sns:Get*",
      "sns:List*"
    ]

    resources = [
      "arn:aws:ecs:${var.aws_region}:${var.account_id}:service/${var.application_name}*",
      "arn:aws:cloudwatch:${var.aws_region}:${var.account_id}:alarm:*",
      "arn:aws:sns:${var.aws_region}:${var.account_id}:*"
    ]
  }
}

resource "aws_iam_policy" "ecs_service_scaling" {
  name        = "${var.application_name}-service-scaling"
  path        = "/"
  description = "Allow ecs service scaling"
  policy      = data.aws_iam_policy_document.ecs_service_scaling.json
}

resource "aws_iam_role_policy_attachment" "ecs_service_scaling" {
  role       = aws_iam_role.ecs_service_role.name
  policy_arn = aws_iam_policy.ecs_service_scaling.arn
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# Task Execution Role (ECS agent — pull images, fetch secrets, mount EFS, write logs)
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

resource "aws_iam_role" "task_execution" {
  name = "${var.application_name}-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = {
    project = var.application_name
  }
}

resource "aws_iam_role_policy_attachment" "task_execution_managed" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "task_execution_extras" {
  name = "${var.application_name}-task-execution-extras"
  role = aws_iam_role.task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SecretsManagerRead"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:${var.account_id}:secret:/appdevexp/*"
      },
      {
        Sid    = "KmsDecrypt"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = var.kms_key_arn
      },
      {
        Sid    = "EfsMount"
        Effect = "Allow"
        Action = [
          "elasticfilesystem:ClientMount",
          "elasticfilesystem:ClientRootAccess",
          "elasticfilesystem:ClientWrite",
          "elasticfilesystem:DescribeMountTargets"
        ]
        Resource = "arn:aws:elasticfilesystem:${var.aws_region}:${var.account_id}:file-system/*"
      }
    ]
  })
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# App Task Role (application code — read /appdevexp/dev/* secrets only)
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

resource "aws_iam_role" "app_task" {
  name = "${var.application_name}-app-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = {
    project = var.application_name
  }
}

resource "aws_iam_role_policy" "app_task_policy" {
  name = "${var.application_name}-app-task-policy"
  role = aws_iam_role.app_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SecretsManagerDevRead"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:${var.account_id}:secret:/appdevexp/dev/*"
      }
    ]
  })
}

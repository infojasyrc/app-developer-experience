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
      "arn:aws:ecs:${var.region}:${var.account_id}:service/${var.application_name}*",
      "arn:aws:cloudwatch:${var.region}:${var.account_id}:alarm:*",
      "arn:aws:sns:${var.region}:${var.account_id}:*"
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

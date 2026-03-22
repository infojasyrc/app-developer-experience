{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowScopedECSOperations",
      "Effect": "Allow",
      "Action": [
        "ecs:*",
        "ecr:GetAuthorizationToken",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchCheckLayerAvailability"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "__AWS_REGION__"
        }
      }
    },
    {
      "Sid": "AllowScopedLogsWrite",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams",
        "logs:DescribeLogGroups"
      ],
      "Resource": [
        "arn:aws:logs:__AWS_REGION__:__AWS_ACCOUNT_ID__:log-group:appdevexp-*",
        "arn:aws:logs:__AWS_REGION__:__AWS_ACCOUNT_ID__:log-group:appdevexp-*:*"
      ]
    },
    {
      "Sid": "AllowScopedSSMRead",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": "arn:aws:ssm:__AWS_REGION__:__AWS_ACCOUNT_ID__:parameter/appdevexp/*"
    },
    {
      "Sid": "AllowScopedSecretsRead",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:__AWS_REGION__:__AWS_ACCOUNT_ID__:secret:appdevexp/*"
    },
    {
      "Sid": "AllowScopedKMSUsage",
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:GenerateDataKey"
      ],
      "Resource": "arn:aws:kms:__AWS_REGION__:__AWS_ACCOUNT_ID__:key/*",
      "Condition": {
        "StringLike": {
          "kms:ViaService": [
            "ssm.__AWS_REGION__.amazonaws.com",
            "secretsmanager.__AWS_REGION__.amazonaws.com",
            "logs.__AWS_REGION__.amazonaws.com"
          ]
        }
      }
    },
    {
      "Sid": "AllowScopedS3AppAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::appdevexp-*",
        "arn:aws:s3:::appdevexp-*/*"
      ]
    },
    {
      "Sid": "AllowObservability",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData",
        "xray:PutTraceSegments",
        "xray:PutTelemetryRecords",
        "xray:GetSamplingRules",
        "xray:GetSamplingTargets"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DenyEscalation",
      "Effect": "Deny",
      "Action": [
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:PutRolePolicy",
        "iam:CreatePolicy",
        "sts:AssumeRole"
      ],
      "Resource": "*"
    }
  ]
}

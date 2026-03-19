{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRPullImage",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchLogsWrite",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": [
        "arn:aws:logs:__AWS_REGION__:__AWS_ACCOUNT_ID__:log-group:appdevexp-*",
        "arn:aws:logs:__AWS_REGION__:__AWS_ACCOUNT_ID__:log-group:appdevexp-*:log-stream:*",
        "arn:aws:logs:__AWS_REGION__:__AWS_ACCOUNT_ID__:log-group:/aws/ecs/appdevexp-*",
        "arn:aws:logs:__AWS_REGION__:__AWS_ACCOUNT_ID__:log-group:/aws/ecs/appdevexp-*:log-stream:*"
      ]
    },
    {
      "Sid": "SSMSecretsAccess",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": "arn:aws:ssm:__AWS_REGION__:__AWS_ACCOUNT_ID__:parameter/appdevexp/*"
    },
    {
      "Sid": "SecretsManagerAccess",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:__AWS_REGION__:__AWS_ACCOUNT_ID__:secret:appdevexp/*"
    },
    {
      "Sid": "KMSDecryptForSecrets",
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
    }
  ]
}

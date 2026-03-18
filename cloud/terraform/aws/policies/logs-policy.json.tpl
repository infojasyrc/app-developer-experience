{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LogGroupManagement",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DeleteLogGroup",
        "logs:DescribeLogGroups",
        "logs:PutRetentionPolicy",
        "logs:AssociateKmsKey",
        "logs:DisassociateKmsKey",
        "logs:TagLogGroup",
        "logs:TagResource",
        "logs:UntagResource",
        "logs:ListTagsForResource"
      ],
      "Resource": [
        "arn:aws:logs:__AWS_REGION__:__AWS_ACCOUNT_ID__:log-group:appdevexp-*",
        "arn:aws:logs:__AWS_REGION__:__AWS_ACCOUNT_ID__:log-group:/aws/ecs/appdevexp-*",
        "arn:aws:logs:__AWS_REGION__:__AWS_ACCOUNT_ID__:log-group:aws-waf-logs-appdevexp-*"
      ]
    },
    {
      "Sid": "LogResourcePolicy",
      "Effect": "Allow",
      "Action": [
        "logs:PutResourcePolicy",
        "logs:DeleteResourcePolicy",
        "logs:DescribeResourcePolicies"
      ],
      "Resource": "*"
    },
    {
      "Sid": "LogGroupDescribeAll",
      "Effect": "Allow",
      "Action": [
        "logs:DescribeLogGroups"
      ],
      "Resource": "*"
    }
  ]
}

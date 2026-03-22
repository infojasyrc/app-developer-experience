{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "TerraformStateManagement",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::__TF_STATE_BUCKET__",
        "arn:aws:s3:::__TF_STATE_BUCKET__/*"
      ]
    },
    {
      "Sid": "TerraformLockManagement",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:__AWS_REGION__:__AWS_ACCOUNT_ID__:table/__TF_LOCK_TABLE__"
    },
    {
      "Sid": "AssumeServiceRoles",
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": [
        "arn:aws:iam::__AWS_ACCOUNT_ID__:role/appdevexp-ecs-deploy-role",
        "arn:aws:iam::__AWS_ACCOUNT_ID__:role/appdevexp-kms-manage-role",
        "arn:aws:iam::__AWS_ACCOUNT_ID__:role/appdevexp-waf-role",
        "arn:aws:iam::__AWS_ACCOUNT_ID__:role/appdevexp-logs-role"
      ]
    }
  ]
}

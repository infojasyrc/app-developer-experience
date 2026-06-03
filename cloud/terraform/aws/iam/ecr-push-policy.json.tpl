{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRGetToken",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECRPush",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage",
        "ecr:DescribeImages",
        "ecr:DescribeRepositories",
        "ecr:ListImages"
      ],
      "Resource": "arn:aws:ecr:__AWS_REGION__:__AWS_ACCOUNT_ID__:repository/*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "__AWS_REGION__"
        }
      }
    }
  ]
}

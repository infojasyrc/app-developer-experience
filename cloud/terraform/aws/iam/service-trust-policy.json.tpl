{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::__AWS_ACCOUNT_ID__:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "ArnLike": {
          "aws:PrincipalArn": "arn:aws:iam::__AWS_ACCOUNT_ID__:role/appdevexp-deployer"
        }
      }
    }
  ]
}
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::__AWS_ACCOUNT_ID__:role/appdevexp-deployer"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "appdevexp-__AWS_REGION__"
        }
      }
    }
  ]
}

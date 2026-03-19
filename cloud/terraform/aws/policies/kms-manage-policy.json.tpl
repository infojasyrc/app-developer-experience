{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "KMSKeyLifecycle",
      "Effect": "Allow",
      "Action": [
        "kms:CreateKey",
        "kms:DescribeKey",
        "kms:GetKeyPolicy",
        "kms:PutKeyPolicy",
        "kms:ScheduleKeyDeletion",
        "kms:CancelKeyDeletion",
        "kms:EnableKeyRotation",
        "kms:DisableKeyRotation",
        "kms:GetKeyRotationStatus",
        "kms:UpdateKeyDescription",
        "kms:TagResource",
        "kms:UntagResource",
        "kms:ListResourceTags",
        "kms:ListKeys",
        "kms:ListAliases"
      ],
      "Resource": "arn:aws:kms:__AWS_REGION__:__AWS_ACCOUNT_ID__:key/*"
    },
    {
      "Sid": "KMSAliasManagement",
      "Effect": "Allow",
      "Action": [
        "kms:CreateAlias",
        "kms:DeleteAlias",
        "kms:UpdateAlias",
        "kms:ListAliases"
      ],
      "Resource": [
        "arn:aws:kms:__AWS_REGION__:__AWS_ACCOUNT_ID__:alias/*",
        "arn:aws:kms:__AWS_REGION__:__AWS_ACCOUNT_ID__:key/*"
      ]
    },
    {
      "Sid": "KMSGrantManagement",
      "Effect": "Allow",
      "Action": [
        "kms:CreateGrant",
        "kms:ListGrants",
        "kms:RevokeGrant"
      ],
      "Resource": "arn:aws:kms:__AWS_REGION__:__AWS_ACCOUNT_ID__:key/*",
      "Condition": {
        "Bool": {
          "kms:GrantIsForAWSResource": "true"
        }
      }
    }
  ]
}

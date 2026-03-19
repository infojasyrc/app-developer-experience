{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "WAFWebACLManagement",
      "Effect": "Allow",
      "Action": [
        "wafv2:CreateWebACL",
        "wafv2:DeleteWebACL",
        "wafv2:GetWebACL",
        "wafv2:UpdateWebACL",
        "wafv2:ListWebACLs",
        "wafv2:TagResource",
        "wafv2:UntagResource",
        "wafv2:ListTagsForResource"
      ],
      "Resource": "arn:aws:wafv2:__AWS_REGION__:__AWS_ACCOUNT_ID__:regional/webacl/*"
    },
    {
      "Sid": "WAFRuleGroupManagement",
      "Effect": "Allow",
      "Action": [
        "wafv2:CreateRuleGroup",
        "wafv2:DeleteRuleGroup",
        "wafv2:GetRuleGroup",
        "wafv2:UpdateRuleGroup",
        "wafv2:ListRuleGroups"
      ],
      "Resource": "arn:aws:wafv2:__AWS_REGION__:__AWS_ACCOUNT_ID__:regional/rulegroup/*"
    },
    {
      "Sid": "WAFIPSetManagement",
      "Effect": "Allow",
      "Action": [
        "wafv2:CreateIPSet",
        "wafv2:DeleteIPSet",
        "wafv2:GetIPSet",
        "wafv2:UpdateIPSet",
        "wafv2:ListIPSets"
      ],
      "Resource": "arn:aws:wafv2:__AWS_REGION__:__AWS_ACCOUNT_ID__:regional/ipset/*"
    },
    {
      "Sid": "WAFLoggingConfiguration",
      "Effect": "Allow",
      "Action": [
        "wafv2:PutLoggingConfiguration",
        "wafv2:GetLoggingConfiguration",
        "wafv2:DeleteLoggingConfiguration"
      ],
      "Resource": "arn:aws:wafv2:__AWS_REGION__:__AWS_ACCOUNT_ID__:regional/webacl/*"
    },
    {
      "Sid": "WAFAssociateResource",
      "Effect": "Allow",
      "Action": [
        "wafv2:AssociateWebACL",
        "wafv2:DisassociateWebACL",
        "wafv2:GetWebACLForResource"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "__AWS_REGION__"
        }
      }
    },
    {
      "Sid": "WAFManagedRuleGroups",
      "Effect": "Allow",
      "Action": [
        "wafv2:ListAvailableManagedRuleGroups",
        "wafv2:DescribeManagedRuleGroup"
      ],
      "Resource": "*"
    },
    {
      "Sid": "WAFServiceLinkedRole",
      "Effect": "Allow",
      "Action": "iam:CreateServiceLinkedRole",
      "Resource": "arn:aws:iam::*:role/aws-service-role/wafv2.amazonaws.com/*",
      "Condition": {
        "StringEquals": {
          "iam:AWSServiceName": "wafv2.amazonaws.com"
        }
      }
    }
  ]
}

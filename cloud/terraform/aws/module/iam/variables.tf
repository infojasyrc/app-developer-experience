variable "application_name" {
  type = string
}

variable "account_id" {
  description = "AWS account ID"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "kms_key_arn" {
  description = "ARN of the KMS key used to decrypt Secrets Manager secrets"
  type        = string
}
variable "application_name" {
  type = string
}

variable "logs_retention_days" {
  type    = number
  default = 5
}

variable "kms_key_id" {
  description = "ARN of KMS key for CloudWatch Logs encryption"
  type        = string
  default     = null
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "tags" {}

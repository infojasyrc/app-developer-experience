variable "application_name" {
  description = "Application name prefix for resource naming"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for the EFS security group"
  type        = string
}

variable "private_subnets" {
  description = "Private subnet IDs — one EFS mount target is created per subnet"
  type        = list(string)
}

variable "allowed_sg_ids" {
  description = "Security group IDs allowed to mount EFS on port 2049 (ECS task SGs)"
  type        = list(string)
  default     = []
}

variable "kms_key_arn" {
  description = "KMS key ARN for EFS encryption at rest"
  type        = string
}

variable "tags" {
  description = "Common resource tags applied to all EFS resources"
  type        = map(string)
  default     = {}
}

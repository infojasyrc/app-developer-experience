variable "application_name" {
  description = "Application name prefix for resource naming"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR block — used for ALB and task egress rules"
  type        = string
}

variable "public_subnets" {
  description = "Public subnet IDs for the external webapp ALB"
  type        = list(string)
}

variable "private_subnets" {
  description = "Private subnet IDs for ECS tasks and the internal API ALB"
  type        = list(string)
}

variable "cluster_id" {
  description = "ECS cluster ID"
  type        = string
}

variable "task_execution_role_arn" {
  description = "ECS task execution role ARN (assumed by the ECS agent to pull images and read secrets)"
  type        = string
}

variable "app_task_role_arn" {
  description = "ECS app task role ARN (assumed by application containers)"
  type        = string
}

variable "api_image" {
  description = "ECR URI for the NestJS API image (include :tag)"
  type        = string
}

variable "ui_image" {
  description = "ECR URI for the Next.js webapp image (include :tag)"
  type        = string
}

variable "aws_region" {
  description = "AWS region for CloudWatch logs configuration"
  type        = string
}

variable "api_domain" {
  description = "API internal subdomain — used as API_INTERNAL_URL for server-side Next.js calls"
  type        = string
}

variable "access_logs_bucket" {
  description = "S3 bucket name for ALB access logs"
  type        = string
}

variable "enable_waf" {
  description = "Attach WAF WebACL to the webapp ALB when true"
  type        = bool
  default     = false
}

variable "waf_acl_arn" {
  description = "WAF WebACL ARN — attached to the webapp external ALB; skipped when empty"
  type        = string
  default     = ""
}

variable "kms_key_arn" {
  description = "KMS key ARN for CloudWatch log group encryption"
  type        = string
}

variable "logs_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
}

variable "mongo_secret_arn" {
  description = "Full Secrets Manager ARN for MongoDB admin credentials — used in ECS valueFrom with JSON key extraction"
  type        = string
}

variable "efs_file_system_id" {
  description = "EFS file system ID mounted by the API task for MongoDB data"
  type        = string
}

variable "mongodb_ap_id" {
  description = "EFS access point ID for /mongodb-data (POSIX uid/gid 999)"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ACM wildcard certificate ARN — enables HTTPS (443) listeners when provided; HTTP only when empty"
  type        = string
  default     = ""
}

variable "enable_deletion_protection" {
  description = "Enable ALB deletion protection"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)
  default     = {}
}

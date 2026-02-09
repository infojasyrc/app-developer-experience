variable "application_name" {
  type = string
}

variable "app_count" {
  description = "Number of docker containers to run"
  type        = number
  default     = 1
}

variable "cluster_id" {
  type = string
}

variable "ecs_task_execution_role" {
  type = string
}

variable "cpu_for_tasks" {
  description = "task instance CPU units to provision (1 vCPU = 1024 CPU units)"
  type        = string
  default     = "4096"
}

variable "memory_for_tasks" {
  description = "task instance memory to provision (in MiB)"
  type        = string
  default     = "8192"
}

variable "container_definitions" {
  description = "rendered container definitions template"
}

variable "health_check_path" {
  description = "url for healthcheck"
  type        = string
  default     = "/"
}

variable "private_subnets" {
  description = "list of private subnets"
}

variable "public_subnets" {
  description = "list of public subnets"
}

variable "vpc_id" {
  type = string
}

variable "container_name" {
  description = "name of the container based on container definitions"
  type        = string
}

variable "assign_public_ip" {
  description = "assign public ip for ecs service"
  type        = bool
}

variable "domain" {
  description = "domain of the application"
  type        = string
}

variable "ui_domain" {
  description = "ui subdomain of the application"
  type        = string
}

variable "api_domain" {
  description = "api domain of the application"
  type        = string
}

variable "tags" {
  description = "all common tags"
}

variable "access_logs_bucket" {
  description = "S3 bucket name for ALB access logs"
  type        = string
}

variable "access_logs_prefix" {
  description = "S3 prefix for ALB access logs"
  type        = string
  default     = "alb-logs"
}

variable "waf_acl_arn" {
  description = "ARN of the WAFv2 Web ACL to associate with ALB"
  type        = string
}

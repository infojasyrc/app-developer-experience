#####
# Main variables
#####

variable "application_name" {
  description = "application project name"
  type        = string
}

variable "aws_account_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_account_id" {
  description = "aws account id"
  type        = string
}

##########################################
### Networking
##########################################

variable "az_count" {
  description = "Number of AZs to cover in a given region"
  type        = string
  default     = "2"
}

variable "vpc_cidr" {
  description = "vpc cidr"
  type        = string
}

##########################################
### Logs
##########################################

variable "logs_retention_days" {
  description = "Amount of days to keep logs"
  type        = number
}

##########################################
### Database
##########################################

variable "db_allocate_storage" {
  type = number
}

variable "db_max_allocate_storage" {
  type = number
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type = string
}

variable "db_multi_zone" {
  type = bool
}

variable "db_deletion_protection" {
  type = bool
}

variable "db_instance_class" {
  # https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.DBInstanceClass.html
  description = "determines the computation and memory capacity of an Amazon RDS DB instance"
  type        = string
}

variable "db_instance_accessible" {
  description = "enable access to the database with a public url"
  type        = bool
}

##########################################
### ECS
##########################################

variable "app_count" {
  description = "Number of docker containers to run"
  type        = number
  default     = 1
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

##########################################
### ECR
##########################################

variable "ecr_frontend" {
  type = string
}

variable "ecr_backend" {
  type = string
}

variable "container_name" {
  type = string
}

##########################################
### ECS
##########################################

variable "assign_public_ip" {
  description = "assign public ip for ecs service"
  type        = bool
}

variable "flask_mode" {
  type = string
}

variable "health_check_path" {
  description = "url for healthcheck"
  type        = string
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

##########################################
### Auto Scaling
##########################################

variable "max_capacity" {
  description = "max capacity to increase"
  type        = number
}

variable "min_capacity" {
  description = "minimun capacity of the cluster"
  type        = number
}

variable "target_for_cpu" {
  description = "amount of cpu to track and apply policy to auto scale"
  type        = number
}

variable "target_for_memory" {
  description = "amount of memory to track and apply policy to auto scale"
  type        = number
}

##########################################
### Application Information
##########################################

variable "api_entrypoint_folder" {
  description = "main folder where api entrypoint file is located"
  type        = string
}

variable "migration_entrypoint_folder" {
  description = "main folder where migration entrypoint file is located"
  type        = string
}

##########################################
### Feature Flags
##########################################

variable "enable_database" {
  description = "Enable database module"
  type        = bool
  default     = false
}

variable "enable_iam" {
  description = "Enable IAM module"
  type        = bool
  default     = false
}

variable "enable_application" {
  description = "Enable application module"
  type        = bool
  default     = false
}

variable "enable_auto_scaling" {
  description = "Enable auto scaling module"
  type        = bool
  default     = false
}
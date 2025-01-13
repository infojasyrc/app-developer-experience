variable "application_name" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "ecs_service_name" {
  description = "aws ecs service name"
  type        = string
}

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

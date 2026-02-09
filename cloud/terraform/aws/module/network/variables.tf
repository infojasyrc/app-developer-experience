variable "vpc_cidr" {
  description = "vpc cidr"
  type        = string
}

variable "az_count" {
  description = "Number of AZs to cover in a given region"
  type        = string
}

variable "vpc_flow_logs_group_arn" {
  description = "CloudWatch Logs group ARN for VPC Flow Logs"
  type        = string
}

variable "tags" {
  description = "Tags to be applied to all resources"
  type        = map(string)
}

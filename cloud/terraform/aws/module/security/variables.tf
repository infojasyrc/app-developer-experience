variable "application_name" {
  type = string
}

variable "waf_log_group_arn" {
  description = "CloudWatch Logs group ARN for WAF logging"
  type        = string
}

variable "tags" {
  description = "Tags to be applied to all resources"
  type        = map(string)
}

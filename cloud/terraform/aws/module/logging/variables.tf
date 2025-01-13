variable "application_name" {
  type = string
}

variable "logs_retention_days" {
  type    = number
  default = 5
}

variable "tags" {}

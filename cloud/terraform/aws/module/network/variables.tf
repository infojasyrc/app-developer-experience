variable "vpc_cidr" {
  description = "vpc cidr"
  type        = string
}

variable "az_count" {
  description = "Number of AZs to cover in a given region"
  type        = string
}

variable "tags" {}

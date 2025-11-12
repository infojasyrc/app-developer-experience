variable "name" { type = string }
variable "network_cidr" { type = string}
variable "az_count" { type = string }
variable "public_subnet_cidrs" { type = list(string) }
variable "private_subnet_cidrs" { type = list(string) }
variable "location" { type = string } # maps to aws region
variable "enable_nat" { type = bool, default = true }
variable "tags" { type = map(string), default = {} }

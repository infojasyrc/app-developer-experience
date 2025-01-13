variable "application_name" {
  type = string
}

variable "db_allocate_storage" {
  type    = number
  default = 20
}

variable "db_max_allocate_storage" {
  type    = number
  default = 50
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
  type    = bool
  default = true
}

variable "db_deletion_protection" {
  type    = bool
  default = false
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

variable "private_subnets" {
  description = "list of private subnets"
}

variable "vpc_id" {
  type = string
}

variable "tags" {}

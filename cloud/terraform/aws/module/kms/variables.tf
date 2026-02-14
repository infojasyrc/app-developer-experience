variable "application_name" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "terraform_role_name" {
  type        = string
  description = "IAM role name for Terraform/GitHub Actions that needs KMS access"
  default     = "GitHubActionsTerraformRole"
}

variable "tags" {
  type = map(string)
}
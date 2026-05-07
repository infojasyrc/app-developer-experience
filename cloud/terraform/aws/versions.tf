terraform {
  required_version = ">= 1.13.0"
  backend "s3" {
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

# Default provider — deployer role, state management only (S3 + DynamoDB lock)
provider "aws" {
  region = var.aws_account_region
}

# ECS cluster, EC2 networking, ALB, IAM role creation for VPC flow logs
provider "aws" {
  alias  = "ecs"
  region = var.aws_account_region

  assume_role {
    role_arn     = "arn:aws:iam::${var.aws_account_id}:role/appdevexp-ecs-deploy-role"
    session_name = "TerraformECS"
  }
}

# KMS key lifecycle — kms module
provider "aws" {
  alias  = "kms"
  region = var.aws_account_region

  assume_role {
    role_arn     = "arn:aws:iam::${var.aws_account_id}:role/appdevexp-kms-manage-role"
    session_name = "TerraformKMS"
  }
}

# CloudWatch log groups and resource policies — logging module (CW resources)
provider "aws" {
  alias  = "logs"
  region = var.aws_account_region

  assume_role {
    role_arn     = "arn:aws:iam::${var.aws_account_id}:role/appdevexp-logs-role"
    session_name = "TerraformLogs"
  }
}

# WAFv2 web ACL and logging configuration — security module
provider "aws" {
  alias  = "waf"
  region = var.aws_account_region

  assume_role {
    role_arn     = "arn:aws:iam::${var.aws_account_id}:role/appdevexp-waf-role"
    session_name = "TerraformWAF"
  }
}

# S3 bucket management — logging module (ALB access logs bucket)
provider "aws" {
  alias  = "s3"
  region = var.aws_account_region

  assume_role {
    role_arn     = "arn:aws:iam::${var.aws_account_id}:role/appdevexp-s3-manage-role"
    session_name = "TerraformS3"
  }
}

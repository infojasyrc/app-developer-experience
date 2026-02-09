terraform {
  required_version = ">= 1.13.0"
  backend "s3" {
  }
  required_providers {
    #Deploying AWS
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_account_region
}

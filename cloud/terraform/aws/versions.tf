terraform {
  required_providers {
    #Deploying AWS
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.4"
    }

  }
  required_version = ">= 0.15.4"
}

# Configure the AWS Provider and Profiles in aws credentials
provider "aws" {
  region  = "us-east-1"
  profile = "demo-${terraform.workspace}"
}

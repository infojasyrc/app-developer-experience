terraform {
  required_providers {
    #Deploying AWS
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }

  }
  required_version = ">= 1.13.0"
}

# Configure the AWS Provider and Profiles in aws credentials
provider "aws" {
  region  = "us-west-1"
  profile = "terraform-dev"
}

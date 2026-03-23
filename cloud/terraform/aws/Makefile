ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

SHELL := bash
.ONESHELL:                         # run each recipe in a single shell
.SHELLFLAGS := -eu -o pipefail -c  # safer shell defaults
MAKEFLAGS += --output-sync=target  # keep per-target logs grouped

LOG_FILE ?= $(CURDIR)/ade.make.$(shell date +%F).log
# One-liner prelude to trace commands (+) and tee both stdout/stderr to the log
LOG_PRELUDE = exec > >(tee -a '$(LOG_FILE)') 2>&1; PS4='+ [$@] '; set -x;

# Default target (runs when you just type 'make')
.DEFAULT_GOAL := help

AWS_REGION        := $(AWS_REGION)
# Gets the AWS Account ID from your current credentials
AWS_ACCOUNT_ID    := $(AWS_ACCOUNT_ID)
# The admin IAM user to run admin tasks
ADMIN_USER_NAME   := $(ADMIN_USER_NAME)
# A globally unique name for the S3 state bucket
TF_STATE_BUCKET   := $(TF_STATE_BUCKET)
# A unique name for the DynamoDB lock table
TF_LOCK_TABLE     := ade-terraform-lock-table

# The .conf file for backend initialization (add this to .gitignore!)
BACKEND_CONFIG := backend.conf

# discover the absolute path to the project repo on the host machine
ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

# --- Include Modules ---
#
## Import Roles
include makefiles/aws-roles.mk
# Import all admin setup tasks from this file
include makefiles/aws-backend.mk
## Import ECR tasks
include makefiles/aws-ecr.mk

# --- Phony Targets ---
.PHONY: all help init plan apply destroy

init: ## 🏁 Initialize Terraform with the backend
	@echo "Initializing Terraform..."
	terraform init -backend-config=$(BACKEND_CONFIG) -input=false

plan: ## 📋 Generate a Terraform execution plan (as TF USER)
	terraform plan -input=false -out=plans/plan.tfplan

apply: ## 🚀 Create or update infrastructure (as TF USER)
	terraform apply plans/plan.tfplan

destroy: ## 💥 Destroy all infrastructure in this state (as TF USER)
	terraform destroy --auto-approve

.PHONY: help
help:  ## ✨ show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort -u | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif

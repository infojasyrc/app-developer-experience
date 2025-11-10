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
# The name for the IAM user that Terraform will use
IAM_USER_NAME     := $(IAM_USER_NAME)
# A globally unique name for the S3 state bucket
TF_STATE_BUCKET   := $(TF_STATE_BUCKET)
# A unique name for the DynamoDB lock table
TF_LOCK_TABLE     := ade-terraform-lock-table
# The name of the IAM policy to create
IAM_POLICY_NAME   := TerraformBackendPolicy
# The JSON file containing the policy document`
IAM_POLICY_FILE   := terraform-backend-policy.json

# The .conf file for backend initialization (add this to .gitignore!)
BACKEND_CONFIG    := backend.conf

# discover the absolute path to the project repo on the host machine
ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

## -----------------------------------------------------------------------------
## 1. ADMIN SETUP (Run as Admin)
## -----------------------------------------------------------------------------

.PHONY: whoami
whoami: ## 👤 Show the AWS identity for the current credentials
	aws sts get-caller-identity --profile $(IAM_USER_NAME) --output table

.PHONY: setup-backend
setup-backend: create-bucket create-lock-table attach-policy ## 🚀 Run all one-time backend setup steps (as ADMIN)
	@echo "✅ Backend resources created successfully."
	@echo "Run 'make create-keys' next to generate credentials."

.PHONY: create-bucket
create-bucket: ## 🪣 Create and configure the S3 state bucket (as ADMIN)
	$(LOG_PRELUDE)
	@echo "Creating S3 bucket: $(TF_STATE_BUCKET)..."
	@if [ "$(AWS_REGION)" = "us-east-1" ]; then \
		aws s3api create-bucket --bucket $(TF_STATE_BUCKET) --region $(AWS_REGION); \
	else \
		aws s3api create-bucket --bucket $(TF_STATE_BUCKET) --region $(AWS_REGION) \
			--create-bucket-configuration LocationConstraint=$(AWS_REGION); \
	fi
	
	@echo "Enabling S3 versioning..."
	aws s3api put-bucket-versioning --bucket $(TF_STATE_BUCKET) \
		--versioning-configuration Status=Enabled
	
	@echo "Blocking all S3 public access..."
	aws s3api put-public-access-block \
		--bucket $(TF_STATE_BUCKET) \
		--public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

	@echo "Tagging S3 bucket..."
	aws s3api put-bucket-tagging \
		--bucket $(TF_STATE_BUCKET) \
		--tagging 'TagSet=[{Key="Purpose",Value="Terraform-State-Backend"},{Key="Environment",Value="Global"}]'

.PHONY: create-lock-table
create-lock-table: ## 🔒 Create the DynamoDB lock table (as ADMIN)
	@echo "Creating DynamoDB lock table: $(TF_LOCK_TABLE)..."
	aws dynamodb create-table \
		--table-name $(TF_LOCK_TABLE) \
		--attribute-definitions AttributeName=LockID,AttributeType=S \
		--key-schema AttributeName=LockID,KeyType=HASH \
		--provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
		--region $(AWS_REGION)

.PHONY: create-policy
create-policy: ## 📜 Create the IAM least-privilege policy (as ADMIN)
	@echo "Creating IAM policy: $(IAM_POLICY_NAME) from $(IAM_POLICY_FILE)..."
	@echo "NOTE: This requires a policy file named '$(IAM_POLICY_FILE)'."
	@echo "It must be customized with your Account ID, Bucket, and Table names."
	aws iam create-policy \
		--policy-name $(IAM_POLICY_NAME) \
		--policy-document file://$(IAM_POLICY_FILE)

.PHONY: create-user
create-user: ## 👤 Create the limited IAM user (as ADMIN)
	@echo "Creating IAM user: $(IAM_USER_NAME)..."
	aws iam create-user --user-name $(IAM_USER_NAME)

.PHONY: attach-policy
attach-policy: create-user create-policy ## 📎 Attach the IAM policy to the user (as ADMIN)
	@echo "Attaching policy to user..."
	aws iam attach-user-policy \
		--user-name $(IAM_USER_NAME) \
		--policy-arn arn:aws:iam::$(AWS_ACCOUNT_ID):policy/$(IAM_POLICY_NAME)

.PHONY: create-keys
create-keys: ## 🔑 Generate access keys for the TF user (as ADMIN)
	@echo "-------------------------------------------------------------------------"
	@echo " ⚠️  GENERATING SENSITIVE CREDENTIALS ⚠️"
	@echo "Store these keys securely (e.g., in a password manager or CI/CD secrets)."
	@echo "You will use these for the 'init', 'plan', and 'apply' steps."
	@echo "This is the ONLY time the SecretAccessKey will be shown."
	@echo "-------------------------------------------------------------------------"
	aws iam create-access-key --user-name $(IAM_USER_NAME)

## -----------------------------------------------------------------------------
## 2. TERRAFORM WORKFLOW (Run as TF User)
## -----------------------------------------------------------------------------

.PHONY: init
init: ## 🏁 Initialize Terraform with the backend (as TF USER)
	@echo "Initializing Terraform..."
	@echo "NOTE: This requires AWS credentials for '$(IAM_USER_NAME)'."
	terraform init -backend-config=$(BACKEND_CONFIG)

.PHONY: plan
plan: ## 📋 Generate a Terraform execution plan (as TF USER)
	terraform plan

.PHONY: apply
apply: ## 🚀 Create or update infrastructure (as TF USER)
	terraform apply

.PHONY: destroy
destroy: ## 💥 Destroy all infrastructure in this state (as TF USER)
	terraform destroy

.PHONY: help
help:  ## ✨ show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort -u | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif

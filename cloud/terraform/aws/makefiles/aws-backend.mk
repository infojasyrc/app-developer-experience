# ==============================================================================
# AWS Backend Infrastructure Setup
#
# One-time, admin-only tasks for creating the Terraform remote state backend
# (S3 bucket, DynamoDB lock table) and registering the GitHub OIDC provider.
#
# IAM roles and policies are managed separately in aws-roles.mk.
# ==============================================================================

# --- Phony Targets ---
.PHONY: setup-backend create-bucket create-lock-table \
create-oidc-provider whoami list-resources

## -----------------------------------------------------------------------------
## Backend Infrastructure (Run as Admin)
## -----------------------------------------------------------------------------

setup-backend: create-bucket create-lock-table create-oidc-provider ## 🚀 Create S3 bucket, DynamoDB table, and OIDC provider (as ADMIN)
	@echo "✅ Backend infrastructure created. Run bootstrap-all next to set up IAM roles."

create-bucket: ## 🪣 Create and configure the S3 state bucket (as ADMIN)
	@echo "Creating S3 bucket: $(TF_STATE_BUCKET)..."
	aws s3api create-bucket \
		--bucket $(TF_STATE_BUCKET) \
		--region $(AWS_REGION)

	@echo "Enabling S3 versioning..."
	aws s3api put-bucket-versioning \
		--bucket $(TF_STATE_BUCKET) \
		--versioning-configuration Status=Enabled

	@echo "Blocking all S3 public access..."
	aws s3api put-public-access-block \
		--bucket $(TF_STATE_BUCKET) \
		--public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

	@echo "Tagging S3 bucket..."
	aws s3api put-bucket-tagging \
		--bucket $(TF_STATE_BUCKET) \
		--tagging 'TagSet=[{Key="Purpose",Value="Terraform-State-Backend"},{Key="Environment",Value="Global"}]'

create-lock-table: ## 🔒 Create the DynamoDB lock table (as ADMIN)
	@echo "Creating DynamoDB lock table: $(TF_LOCK_TABLE)..."
	aws dynamodb create-table \
		--table-name $(TF_LOCK_TABLE) \
		--attribute-definitions AttributeName=LockID,AttributeType=S \
		--key-schema AttributeName=LockID,KeyType=HASH \
		--provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
		--region $(AWS_REGION)

create-oidc-provider: ## 🛡️ Register GitHub as an OIDC Provider (Run ONCE per account)
	@echo "Creating OIDC Provider for GitHub..."
	aws iam create-open-id-connect-provider \
		--url https://token.actions.githubusercontent.com \
		--client-id-list sts.amazonaws.com \
		--thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 || echo "Provider already exists."

## -----------------------------------------------------------------------------
## Utilities
## -----------------------------------------------------------------------------

whoami: ## 👤 Show the AWS identity for the current credentials
	aws sts get-caller-identity --profile $(ADMIN_USER_NAME) --output table

list-resources: ## 📋 List AWS resources with specific tags (as ADMIN)
	aws resourcegroupstaggingapi get-resources \
		--tag-filters Key=project,Values=appdevexp \
		--region $(AWS_REGION) \
		--profile $(ADMIN_USER_NAME)

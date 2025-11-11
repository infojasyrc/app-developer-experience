# ==============================================================================
# AWS Backend Admin Setup
#
# This file contains the one-time, admin-only tasks for creating
# the Terraform remote state backend.
# ==============================================================================

# --- Phony Targets ---
# We declare these here as well for clarity
.PHONY: setup-backend create-bucket create-lock-table \
generate-policy-json create-policy create-user attach-policy \
create-keys clean whoami

## -----------------------------------------------------------------------------
## 1. ADMIN SETUP (Run as Admin)
## -----------------------------------------------------------------------------

setup-backend: create-bucket create-lock-table attach-policy ## 🚀 Run all one-time backend setup steps (as ADMIN)
	@echo "✅ Backend resources created successfully."
	@echo "Run 'make create-keys' next to generate credentials."

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

generate-policy-json: ## 📄 Generate the IAM policy JSON from the template
	@echo "Generating $(IAM_POLICY_FILE) from template..."
	@sed -e 's|__AWS_ACCOUNT_ID__|$(AWS_ACCOUNT_ID)|g' \
		-e 's|__TF_STATE_BUCKET__|$(TF_STATE_BUCKET)|g' \
		-e 's|__TF_LOCK_TABLE__|$(TF_LOCK_TABLE)|g' \
		$(IAM_POLICY_TEMPLATE) > $(IAM_POLICY_FILE)

create-policy: generate-policy-json ## 📜 Create the IAM least-privilege policy (as ADMIN)
	@echo "Creating IAM policy: $(IAM_POLICY_NAME) from $(IAM_POLICY_FILE)..."
	aws iam create-policy \
		--policy-name $(IAM_POLICY_NAME) \
		--policy-document file://$(IAM_POLICY_FILE)

create-user: ## 👤 Create the limited IAM user (as ADMIN)
	@echo "Creating IAM user: $(IAM_USER_NAME)..."
	aws iam create-user --user-name $(IAM_USER_NAME) || echo "User already exists."

attach-policy: create-user create-policy ## 📎 Attach the IAM policy to the user (as ADMIN)
	@echo "Attaching policy to user..."
	aws iam attach-user-policy \
		--user-name $(IAM_USER_NAME) \
		--policy-arn arn:aws:iam::$(AWS_ACCOUNT_ID):policy/$(IAM_POLICY_NAME)

create-keys: ## 🔑 Generate access keys for the TF user (as ADMIN)
	@echo "-------------------------------------------------------------------------"
	@echo " ⚠️  GENERATING SENSITIVE CREDENTIALS ⚠️"
	@echo "Store these keys securely (e.g., in a password manager or CI/CD secrets)."
	@echo "You will use these for the 'init', 'plan', and 'apply' steps."
	@echo "This is the ONLY time the SecretAccessKey will be shown."
	@echo "-------------------------------------------------------------------------"
	aws iam create-access-key --user-name $(IAM_USER_NAME)

whoami: ## 👤 Show the AWS identity for the current credentials
	aws sts get-caller-identity --profile $(IAM_USER_NAME) --output table

## -----------------------------------------------------------------------------
## 3. CLEANUP
## -----------------------------------------------------------------------------

clean: ## 🧹 Remove generated files
	@echo "Cleaning up generated files..."
	@rm -f $(IAM_POLICY_FILE)
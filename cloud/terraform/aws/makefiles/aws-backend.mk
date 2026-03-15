# ==============================================================================
# AWS Backend Admin Setup
#
# This file contains the one-time, admin-only tasks for creating
# the Terraform remote state backend.
# ==============================================================================

GITHUB_ROLE_NAME = GitHubActionsTerraformRole

# --- Phony Targets ---
# We declare these here as well for clarity
.PHONY: setup-backend create-bucket create-lock-table \
generate-policy-json create-policy update-policy create-user attach-policy \
create-keys clean whoami create-oidc-provider list-resources

## -----------------------------------------------------------------------------
## 1. ADMIN SETUP (Run as Admin)
## -----------------------------------------------------------------------------

setup-backend: create-bucket create-lock-table create-oidc-provider attach-policy-to-role ## 🚀 Run all one-time backend setup steps (as ADMIN)
	@echo "✅ Backend resources and OIDC Role created successfully."
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
		-e 's|__AWS_REGION__|$(AWS_REGION)|g' \
		$(IAM_POLICY_TEMPLATE) | python3 -c 'import sys, json; print(json.dumps(json.load(sys.stdin), separators=(",", ":")))' > $(IAM_POLICY_FILE)

create-policy: generate-policy-json ## 📜 Create the IAM least-privilege policy (as ADMIN)
	@echo "Creating IAM policy: $(IAM_POLICY_NAME) from $(IAM_POLICY_FILE)..."
	aws iam create-policy \
		--policy-name $(IAM_POLICY_NAME) \
		--policy-document file://$(IAM_POLICY_FILE) \
		--profile $(ADMIN_USER_NAME) || echo "Policy already exists."

update-policy: generate-policy-json ## 🆙 Update IAM policy with a new version
	@echo "Updating IAM policy: $(IAM_POLICY_NAME)..."
	@# Cleanup: Delete the oldest version if we hit the limit of 5
	@VERSIONS=$$(aws iam list-policy-versions --policy-arn $(POLICY_ARN) --query 'Versions[?IsDefaultVersion==`false`].VersionId' --output text); \
	COUNT=$$(echo $$VERSIONS | wc -w); \
	if [ $$COUNT -ge 4 ]; then \
		OLDEST=$$(echo $$VERSIONS | awk '{print $$NF}'); \
		echo "Reaching version limit. Deleting oldest version: $$OLDEST"; \
		aws iam delete-policy-version --policy-arn $(POLICY_ARN) --version-id $$OLDEST; \
	fi
	@# Create the new version
	aws iam create-policy-version \
		--policy-arn $(POLICY_ARN) \
		--policy-document file://$(IAM_POLICY_FILE) \
		--set-as-default
	@echo "✅ Policy updated to new version and set as default."

create-user: ## 👤 Create the limited IAM user (as ADMIN)
	@echo "Creating IAM user: $(IAM_USER_NAME)..."
	aws iam create-user --user-name $(IAM_USER_NAME) --profile $(ADMIN_USER_NAME) || echo "User already exists."

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

create-oidc-provider: ## 🛡️ Register GitHub as an OIDC Provider (Run ONCE per account)
	@echo "Creating OIDC Provider for GitHub..."
	aws iam create-open-id-connect-provider \
		--url https://token.actions.githubusercontent.com \
		--client-id-list sts.amazonaws.com \
		--thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 || echo "Provider already exists."

create-oidc-role: ## 🎭 Create the IAM Role for GitHub OIDC
	@echo "Generating trust-policy.json..."
	@sed -e 's|__AWS_ACCOUNT_ID__|$(AWS_ACCOUNT_ID)|g' \
		-e 's|__GITHUB_USER__|$(GITHUB_ORG)|g' \
		-e 's|__REPO_NAME__|$(REPO_NAME)|g' \
		$(IAM_TRUST_POLICY_TEMPLATE) > $(IAM_TRUST_POLICY_FILE)

	@echo "Updating/Creating IAM Role: $(GITHUB_ROLE_NAME)..."
	@if aws iam get-role --role-name $(GITHUB_ROLE_NAME) > /dev/null 2>&1; then \
		aws iam update-assume-role-policy --role-name $(GITHUB_ROLE_NAME) --policy-document file://$(IAM_TRUST_POLICY_FILE); \
		echo "✅ Trust policy updated."; \
	else \
		aws iam create-role --role-name $(GITHUB_ROLE_NAME) --assume-role-policy-document file://$(IAM_TRUST_POLICY_FILE); \
		echo "✅ Role created."; \
	fi

attach-policy-to-role: create-policy ## 📎 Attach the permission policy to the OIDC Role
	@echo "Attaching policy to OIDC Role..."
	aws iam attach-role-policy \
		--role-name $(GITHUB_ROLE_NAME) \
		--policy-arn arn:aws:iam::$(AWS_ACCOUNT_ID):policy/$(IAM_POLICY_NAME)

whoami: ## 👤 Show the AWS identity for the current credentials
	aws sts get-caller-identity --profile $(ADMIN_USER_NAME) --output table

## -----------------------------------------------------------------------------
## 3. CLEANUP
## -----------------------------------------------------------------------------

clean: ## 🧹 Remove generated files
	@echo "Cleaning up generated files..."
	@rm -f $(IAM_POLICY_FILE)


## -----------------------------------------------------------------------------
## 4. Management
## -----------------------------------------------------------------------------

list-resources: ## 📋 List AWS resources with specific tags (as ADMIN)
	aws resourcegroupstaggingapi get-resources \
		--tag-filters Key=project,Values=appdevexp \
		--region $(AWS_REGION) \
		--profile $(ADMIN_USER_NAME)

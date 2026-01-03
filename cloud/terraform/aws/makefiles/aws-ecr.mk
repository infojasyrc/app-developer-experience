# ============================================================================
# AWS ECR (Elastic Container Registry) helper targets
# ----------------------------------------------------------------------------
# Frontend and Backend repository creation + login + helper outputs.
# These targets are intended to be run by an ADMIN user (able to create ECR
# repositories) except for login/push which can be done by developers that
# have ECR permissions.
# ============================================================================

.PHONY: ecr-print-values ecr-login ecr-create ecr-delete

# Repository name overrides (customize if desired)
ECR_FRONTEND_NAME ?= frontend
ECR_BACKEND_NAME  ?= backend

# Optional default for custom creation (can be overridden or left blank to prompt)
CUSTOM_REPO_NAME ?=
PREFIX_REPO_NAME ?= conference-manager

# Derived registry URI
ECR_REGISTRY      := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
ECR_FRONTEND_REPO := $(ECR_REGISTRY)/$(PREFIX_REPO_NAME)/$(ECR_FRONTEND_NAME)
ECR_BACKEND_REPO  := $(ECR_REGISTRY)/$(PREFIX_REPO_NAME)/$(ECR_BACKEND_NAME)

# Common tags for repositories (AWS CLI tag shorthand to avoid JSON quoting issues)
ECR_TAGS ?= Key=Project,Value=ade Key=Component,Value=ecr

## ---------------------------------------------------------------------------
## LOGIN / OUTPUT HELPERS
## ---------------------------------------------------------------------------

ecr-print-values: ## 🔎 Print repository URIs to set in terraform.tfvars (any user)
	@echo "ecr_frontend            = \"$(ECR_FRONTEND_REPO)\""
	@echo "ecr_backend             = \"$(ECR_BACKEND_REPO)\""

print-ecr-values: ## (DEPRECATED) Alias for ecr-print-values
	@$(MAKE) ecr-print-values

ecr-login: ## 🔐 Docker login to ECR (any user with permissions)
	@echo "Logging into ECR registry: $(ECR_REGISTRY)"
	@aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_REGISTRY)
	@echo "✅ Docker is authenticated to $(ECR_REGISTRY)"

## ---------------------------------------------------------------------------
## CREATE / DELETE REPOSITORIES (ADMIN)
## ---------------------------------------------------------------------------

ecr-create: ## 🐳 Create a ECR repository (ADMIN). Usage: make ecr-create-custom [NAME=my-repo]
	@bash -c 'NAME="$(NAME)"; \
	if [ -z "$$NAME" ]; then NAME="$(CUSTOM_REPO_NAME)"; fi; \
	if [ -z "$$NAME" ]; then read -p "Enter ECR repository name: " NAME; fi; \
	echo "Ensuring ECR repository exists: $$NAME"; \
	if aws ecr describe-repositories --repository-names $$PREFIX_REPO_NAME/$$NAME >/dev/null 2>&1; then \
		echo "Repository $$NAME already exists."; \
	else \
		echo "Creating repository $$NAME..."; \
		aws ecr create-repository \
			--repository-name $(PREFIX_REPO_NAME)/$$NAME \
			--image-scanning-configuration scanOnPush=true \
			--encryption-configuration encryptionType=KMS \
			--tags $(ECR_TAGS) \
			--region $(AWS_REGION); \
	fi; \
	echo "✅ Repo URI: $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$$PREFIX_REPO_NAME/$$NAME"'

ecr-delete: ## ❌ Delete a ECR repository (DANGEROUS). Usage: make ecr-delete-custom NAME=my-repo
	@bash -c 'NAME=$${NAME}; \
	if [ -z "$$NAME" ]; then read -p "Enter ECR repository name to DELETE: " NAME; fi; \
	echo "Deleting repository $$NAME (images will be lost)..."; \
	aws ecr delete-repository --repository-name $$PREFIX_REPO_NAME/$$NAME --force --region $(AWS_REGION); \
	echo "✅ Deleted $$PREFIX_REPO_NAME/$$NAME"'

# NOTE: Build & push targets are intentionally omitted here because the repo has
# multiple services. Consider creating per-service Makefiles that tag & push
# using the repository URIs above, e.g.:
# docker build -t $(ECR_FRONTEND_REPO):latest path/to/webapp
# docker push $(ECR_FRONTEND_REPO):latest

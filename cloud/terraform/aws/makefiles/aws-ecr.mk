# ============================================================================
# AWS ECR (Elastic Container Registry) helper targets
# ----------------------------------------------------------------------------
# Frontend and Backend repository creation + login + helper outputs.
# These targets are intended to be run by an ADMIN user (able to create ECR
# repositories) except for login/push which can be done by developers that
# have ECR permissions.
# ============================================================================

.PHONY: ecr-create-frontend ecr-create-backend ecr-delete-frontend ecr-delete-backend \
ecr-print-values ecr-login ecr-create-custom ecr-delete-custom

# Repository name overrides (customize if desired)
ECR_FRONTEND_NAME ?= frontend
ECR_BACKEND_NAME  ?= backend

# Optional default for custom creation (can be overridden or left blank to prompt)
CUSTOM_REPO_NAME ?=

# Derived registry URI
ECR_REGISTRY      := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
ECR_FRONTEND_REPO := $(ECR_REGISTRY)/$(ECR_FRONTEND_NAME)
ECR_BACKEND_REPO  := $(ECR_REGISTRY)/$(ECR_BACKEND_NAME)

# Common tags for repositories
ECR_TAGS_JSON := '[{"Key":"Project","Value":"ade"},{"Key":"Component","Value":"ecr"}]'

## ---------------------------------------------------------------------------
## CREATE / DELETE REPOSITORIES (ADMIN)
## ---------------------------------------------------------------------------

ecr-create-frontend: ## 🐳 Create (if missing) the Frontend ECR repository (as ADMIN)
	@echo "Ensuring frontend ECR repository exists: $(ECR_FRONTEND_NAME)"
	@if aws ecr describe-repositories --repository-names $(ECR_FRONTEND_NAME) >/dev/null 2>&1; then \
		 echo "Repository already exists."; \
	 else \
		 echo "Creating repository..."; \
		 aws ecr create-repository \
		   --repository-name $(ECR_FRONTEND_NAME) \
		   --image-scanning-configuration scanOnPush=true \
		   --encryption-configuration encryptionType=KMS \
		   --tags $(ECR_TAGS_JSON) \
		   --region $(AWS_REGION); \
	 fi
	@echo "✅ Frontend repo: $(ECR_FRONTEND_REPO)"

ecr-create-backend: ## 🐳 Create (if missing) the Backend ECR repository (as ADMIN)
	@echo "Ensuring backend ECR repository exists: $(ECR_BACKEND_NAME)"
	@if aws ecr describe-repositories --repository-names $(ECR_BACKEND_NAME) >/dev/null 2>&1; then \
		 echo "Repository already exists."; \
	 else \
		 echo "Creating repository..."; \
		 aws ecr create-repository \
		   --repository-name $(ECR_BACKEND_NAME) \
		   --image-scanning-configuration scanOnPush=true \
		   --encryption-configuration encryptionType=KMS \
		   --tags $(ECR_TAGS_JSON) \
		   --region $(AWS_REGION); \
	 fi
	@echo "✅ Backend repo: $(ECR_BACKEND_REPO)"

ecr-delete-frontend: ## ❌ Delete the Frontend ECR repository (DANGEROUS, ADMIN)
	@echo "Deleting frontend repository (images will be lost): $(ECR_FRONTEND_NAME)"
	@aws ecr delete-repository --repository-name $(ECR_FRONTEND_NAME) --force --region $(AWS_REGION)

ecr-delete-backend: ## ❌ Delete the Backend ECR repository (DANGEROUS, ADMIN)
	@echo "Deleting backend repository (images will be lost): $(ECR_BACKEND_NAME)"
	@aws ecr delete-repository --repository-name $(ECR_BACKEND_NAME) --force --region $(AWS_REGION)
	@$(MAKE) ecr-delete-backend

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
## CUSTOM / INTERACTIVE REPO CREATION & DELETION
## ---------------------------------------------------------------------------

ecr-create-custom: ## 🐳 Interactively create (if missing) a custom ECR repository (ADMIN). Usage: make ecr-create-custom [NAME=my-repo]
	@bash -c 'NAME=$${NAME:-$(CUSTOM_REPO_NAME)}; \
	 if [ -z "$$NAME" ]; then read -p "Enter ECR repository name: " NAME; fi; \
	 echo "Ensuring ECR repository exists: $$NAME"; \
	 if aws ecr describe-repositories --repository-names $$NAME >/dev/null 2>&1; then \
	   echo "Repository $$NAME already exists."; \
	 else \
	   echo "Creating repository $$NAME..."; \
	   aws ecr create-repository \
	     --repository-name $$NAME \
	     --image-scanning-configuration scanOnPush=true \
	     --encryption-configuration encryptionType=KMS \
	     --tags $(ECR_TAGS_JSON) \
	     --region $(AWS_REGION); \
	 fi; \
	 echo "✅ Repo URI: $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$$NAME"'

ecr-delete-custom: ## ❌ Interactively delete a custom ECR repository (DANGEROUS). Usage: make ecr-delete-custom NAME=my-repo
	create-ecr-custom: ## (DEPRECATED) Alias for ecr-create-custom
		@$(MAKE) ecr-create-custom

	delete-ecr-custom: ## (DEPRECATED) Alias for ecr-delete-custom
		@$(MAKE) ecr-delete-custom
	@bash -c 'NAME=$${NAME}; \
	 if [ -z "$$NAME" ]; then read -p "Enter ECR repository name to DELETE: " NAME; fi; \
	 echo "Deleting repository $$NAME (images will be lost)..."; \
	 aws ecr delete-repository --repository-name $$NAME --force --region $(AWS_REGION); \
	 echo "✅ Deleted $$NAME"'

# NOTE: Build & push targets are intentionally omitted here because the repo has
# multiple services. Consider creating per-service Makefiles that tag & push
# using the repository URIs above, e.g.:
# docker build -t $(ECR_FRONTEND_REPO):latest path/to/webapp
# docker push $(ECR_FRONTEND_REPO):latest

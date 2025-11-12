# ============================================================================
# AWS ECR (Elastic Container Registry) helper targets
# ----------------------------------------------------------------------------
# Frontend and Backend repository creation + login + helper outputs.
# These targets are intended to be run by an ADMIN user (able to create ECR
# repositories) except for login/push which can be done by developers that
# have ECR permissions.
# ============================================================================

.PHONY: create-ecr-frontend create-ecr-backend delete-ecr-frontend delete-ecr-backend \
print-ecr-values ecr-login

# Repository name overrides (customize if desired)
ECR_FRONTEND_NAME ?= frontend
ECR_BACKEND_NAME  ?= backend

# Derived registry URI
ECR_REGISTRY      := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
ECR_FRONTEND_REPO := $(ECR_REGISTRY)/$(ECR_FRONTEND_NAME)
ECR_BACKEND_REPO  := $(ECR_REGISTRY)/$(ECR_BACKEND_NAME)

# Common tags for repositories
ECR_TAGS_JSON := '[{"Key":"Project","Value":"ade"},{"Key":"Component","Value":"ecr"}]'

## ---------------------------------------------------------------------------
## CREATE / DELETE REPOSITORIES (ADMIN)
## ---------------------------------------------------------------------------

create-ecr-frontend: ## 🐳 Create (if missing) the Frontend ECR repository (as ADMIN)
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

create-ecr-backend: ## 🐳 Create (if missing) the Backend ECR repository (as ADMIN)
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

delete-ecr-frontend: ## ❌ Delete the Frontend ECR repository (DANGEROUS, ADMIN)
	@echo "Deleting frontend repository (images will be lost): $(ECR_FRONTEND_NAME)"
	@aws ecr delete-repository --repository-name $(ECR_FRONTEND_NAME) --force --region $(AWS_REGION)

delete-ecr-backend: ## ❌ Delete the Backend ECR repository (DANGEROUS, ADMIN)
	@echo "Deleting backend repository (images will be lost): $(ECR_BACKEND_NAME)"
	@aws ecr delete-repository --repository-name $(ECR_BACKEND_NAME) --force --region $(AWS_REGION)

## ---------------------------------------------------------------------------
## LOGIN / OUTPUT HELPERS
## ---------------------------------------------------------------------------

print-ecr-values: ## 🔎 Print repository URIs to set in terraform.tfvars (any user)
	@echo "ecr_frontend            = \"$(ECR_FRONTEND_REPO)\""
	@echo "ecr_backend             = \"$(ECR_BACKEND_REPO)\""

ecr-login: ## 🔐 Docker login to ECR (any user with permissions)
	@echo "Logging into ECR registry: $(ECR_REGISTRY)"
	@aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_REGISTRY)
	@echo "✅ Docker is authenticated to $(ECR_REGISTRY)"

# NOTE: Build & push targets are intentionally omitted here because the repo has
# multiple services. Consider creating per-service Makefiles that tag & push
# using the repository URIs above, e.g.:
# docker build -t $(ECR_FRONTEND_REPO):latest path/to/webapp
# docker push $(ECR_FRONTEND_REPO):latest

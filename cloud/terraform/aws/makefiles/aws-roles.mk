# ============================================================
# Variables — set these via environment or .env file
# ============================================================
AWS_ACCOUNT_ID  ?= $(error AWS_ACCOUNT_ID is not set)
AWS_REGION      ?= $(error AWS_REGION is not set)
TF_STATE_BUCKET ?= $(error TF_STATE_BUCKET is not set)
TF_LOCK_TABLE   ?= $(error TF_LOCK_TABLE is not set)
GITHUB_USER     ?= $(error GITHUB_USER is not set)
REPO_NAME       ?= $(error REPO_NAME is not set)
APP_NAME        ?= $(error APP_NAME is not set)

DEPLOYER_ROLE   := appdevexp-deployer
TMP             := /tmp/appdevexp

# ============================================================
# Helpers
# ============================================================
.PHONY: _check-env _mkdir-tmp

_mkdir-tmp:
	@mkdir -p $(TMP)

_check-env:
	@echo "Account : $(AWS_ACCOUNT_ID)"
	@echo "Region  : $(AWS_REGION)"
	@echo "App     : $(APP_NAME)"

# ============================================================
# Render targets — produce rendered JSON from .tpl files
# ============================================================
.PHONY: render-trust-policy render-backend-policy render-service-trust \
	render-ecs-policy render-kms-policy render-waf-policy \
	render-logs-policy render-s3-policy render-task-execution-policy \
	render-task-role-policy render-permissions-boundary render-all-policies

render-trust-policy: _mkdir-tmp ## Render OIDC trust policy JSON from template
	@cat iam/terraform-trust-policy.tpl.json \
		| sed 's/__AWS_ACCOUNT_ID__/$(AWS_ACCOUNT_ID)/g' \
		| sed 's/__GITHUB_USER__/$(GITHUB_USER)/g' \
		| sed 's/__REPO_NAME__/$(REPO_NAME)/g' \
		> $(TMP)/terraform-trust-policy.json
	@echo "Rendered: $(TMP)/terraform-trust-policy.json"

render-backend-policy: _mkdir-tmp ## Render Terraform backend policy JSON from template
	@cat iam/terraform-backend-policy.json.tpl \
		| sed 's/__AWS_ACCOUNT_ID__/$(AWS_ACCOUNT_ID)/g' \
		| sed 's/__AWS_REGION__/$(AWS_REGION)/g' \
		| sed 's/__TF_STATE_BUCKET__/$(TF_STATE_BUCKET)/g' \
		| sed 's/__TF_LOCK_TABLE__/$(TF_LOCK_TABLE)/g' \
		> $(TMP)/terraform-backend-policy.json
	@echo "Rendered: $(TMP)/terraform-backend-policy.json"

render-service-trust: _mkdir-tmp ## Render service trust policy JSON from template
	@cat iam/service-trust-policy.tpl.json \
		| sed 's/__AWS_ACCOUNT_ID__/$(AWS_ACCOUNT_ID)/g' \
		| sed 's/__AWS_REGION__/$(AWS_REGION)/g' \
		> $(TMP)/service-trust-policy.json
	@echo "Rendered: $(TMP)/service-trust-policy.json"

render-ecs-policy: _mkdir-tmp ## Render ECS deploy policy JSON from template
	@cat iam/ecs-deploy-policy.json.tpl \
		| sed 's/__AWS_ACCOUNT_ID__/$(AWS_ACCOUNT_ID)/g' \
		| sed 's/__AWS_REGION__/$(AWS_REGION)/g' \
		> $(TMP)/ecs-deploy-policy.json
	@echo "Rendered: $(TMP)/ecs-deploy-policy.json"

render-kms-policy: _mkdir-tmp ## Render KMS manage policy JSON from template
	@cat iam/kms-manage-policy.json.tpl \
		| sed 's/__AWS_ACCOUNT_ID__/$(AWS_ACCOUNT_ID)/g' \
		| sed 's/__AWS_REGION__/$(AWS_REGION)/g' \
		> $(TMP)/kms-manage-policy.json
	@echo "Rendered: $(TMP)/kms-manage-policy.json"

render-waf-policy: _mkdir-tmp ## Render WAF policy JSON from template
	@cat iam/waf-policy.json.tpl \
		| sed 's/__AWS_ACCOUNT_ID__/$(AWS_ACCOUNT_ID)/g' \
		| sed 's/__AWS_REGION__/$(AWS_REGION)/g' \
		> $(TMP)/waf-policy.json
	@echo "Rendered: $(TMP)/waf-policy.json"

render-logs-policy: _mkdir-tmp ## Render CloudWatch logs policy JSON from template
	@cat iam/logs-policy.json.tpl \
		| sed 's/__AWS_ACCOUNT_ID__/$(AWS_ACCOUNT_ID)/g' \
		| sed 's/__AWS_REGION__/$(AWS_REGION)/g' \
		> $(TMP)/logs-policy.json
	@echo "Rendered: $(TMP)/logs-policy.json"

render-s3-policy: _mkdir-tmp ## Render S3 manage policy JSON from template
	@cat iam/s3-manage-policy.json.tpl \
		| sed 's/__AWS_ACCOUNT_ID__/$(AWS_ACCOUNT_ID)/g' \
		| sed 's/__AWS_REGION__/$(AWS_REGION)/g' \
		> $(TMP)/s3-manage-policy.json
	@echo "Rendered: $(TMP)/s3-manage-policy.json"

render-task-execution-policy: _mkdir-tmp ## Render ECS task execution policy JSON from template
	@cat iam/task-execution-policy.json.tpl \
		| sed 's/__AWS_ACCOUNT_ID__/$(AWS_ACCOUNT_ID)/g' \
		| sed 's/__AWS_REGION__/$(AWS_REGION)/g' \
		> $(TMP)/task-execution-policy.json
	@echo "Rendered: $(TMP)/task-execution-policy.json"

render-task-role-policy: _mkdir-tmp ## Render app task role policy JSON from template
	@cat iam/task-role-policy.json.tpl \
		| sed 's/__AWS_ACCOUNT_ID__/$(AWS_ACCOUNT_ID)/g' \
		| sed 's/__AWS_REGION__/$(AWS_REGION)/g' \
		| sed 's/__APP_NAME__/$(APP_NAME)/g' \
		> $(TMP)/task-role-policy.json
	@echo "Rendered: $(TMP)/task-role-policy.json"

render-permissions-boundary: _mkdir-tmp ## Render permissions boundary policy JSON from template
	@cat iam/permissions-boundary.json.tpl \
		| sed 's/__AWS_ACCOUNT_ID__/$(AWS_ACCOUNT_ID)/g' \
		| sed 's/__AWS_REGION__/$(AWS_REGION)/g' \
		> $(TMP)/permissions-boundary.json
	@echo "Rendered: $(TMP)/permissions-boundary.json"

render-all-policies: render-trust-policy render-backend-policy render-service-trust render-ecs-policy render-kms-policy render-waf-policy render-logs-policy render-s3-policy render-task-execution-policy render-task-role-policy render-permissions-boundary ## Render all 11 policy JSON files from templates
	@echo "All policies rendered to $(TMP)/"

# ============================================================
# Bootstrap — one-time manual run to create all roles
# Run order: bootstrap-boundary → bootstrap-deployer → bootstrap-service-roles → bootstrap-runtime-roles
# ============================================================
.PHONY: bootstrap-boundary bootstrap-deployer \
	bootstrap-service-roles bootstrap-runtime-roles bootstrap-all

bootstrap-boundary: render-permissions-boundary ## Create permissions boundary policy (run first)
	@echo "Creating permissions boundary policy..."
	aws iam create-policy \
		--policy-name appdevexp-permissions-boundary \
		--policy-document file://$(TMP)/permissions-boundary.json \
		--description "Permission ceiling for all appdevexp roles"
	@echo "Done: appdevexp-permissions-boundary"

bootstrap-deployer: render-trust-policy render-backend-policy ## Create OIDC deployer role and attach backend policy
	@echo "reating OIDC deployer role..."
	aws iam create-role \
		--role-name $(DEPLOYER_ROLE) \
		--assume-role-policy-document file://$(TMP)/terraform-trust-policy.json \
		--description "GitHub Actions OIDC deployer — assume-only entry point"
	aws iam put-role-policy \
		--role-name $(DEPLOYER_ROLE) \
		--policy-name terraform-backend \
		--policy-document file://$(TMP)/terraform-backend-policy.json
	@echo "Done: $(DEPLOYER_ROLE)"

bootstrap-service-roles: render-service-trust render-ecs-policy render-kms-policy render-waf-policy render-logs-policy render-s3-policy ## Create ECS, KMS, WAF, Logs, and S3 service roles
	@echo "Creating ECS deploy role..."
	aws iam create-role \
		--role-name appdevexp-ecs-deploy-role \
		--assume-role-policy-document file://$(TMP)/service-trust-policy.json \
		--description "ECS/EC2/ALB/ECR management — assumed by deployer"
	aws iam put-role-policy \
		--role-name appdevexp-ecs-deploy-role \
		--policy-name ecs-deploy \
		--policy-document file://$(TMP)/ecs-deploy-policy.json

	@echo "Creating KMS manage role..."
	aws iam create-role \
		--role-name appdevexp-kms-manage-role \
		--assume-role-policy-document file://$(TMP)/service-trust-policy.json \
		--description "KMS key lifecycle management — assumed by deployer"
	aws iam put-role-policy \
		--role-name appdevexp-kms-manage-role \
		--policy-name kms-manage \
		--policy-document file://$(TMP)/kms-manage-policy.json

	@echo "Creating WAF role..."
	aws iam create-role \
		--role-name appdevexp-waf-role \
		--assume-role-policy-document file://$(TMP)/service-trust-policy.json \
		--description "WAF WebACL and rule management — assumed by deployer"
	aws iam put-role-policy \
		--role-name appdevexp-waf-role \
		--policy-name waf-manage \
		--policy-document file://$(TMP)/waf-policy.json

	@echo "Creating Logs role..."
	aws iam create-role \
		--role-name appdevexp-logs-role \
		--assume-role-policy-document file://$(TMP)/service-trust-policy.json \
		--description "CloudWatch log group management — assumed by deployer"
	aws iam put-role-policy \
		--role-name appdevexp-logs-role \
		--policy-name logs-manage \
		--policy-document file://$(TMP)/logs-policy.json

	@echo "Creating S3 manage role..."
	aws iam create-role \
		--role-name appdevexp-s3-manage-role \
		--assume-role-policy-document file://$(TMP)/service-trust-policy.json \
		--description "S3 bucket management — assumed by deployer"
	aws iam put-role-policy \
		--role-name appdevexp-s3-manage-role \
		--policy-name s3-manage \
		--policy-document file://$(TMP)/s3-manage-policy.json

	@echo "Done: all service roles created"

bootstrap-runtime-roles: render-task-execution-policy render-task-role-policy ## Create ECS task execution and app task roles
	@echo "Creating ECS task execution role..."
	aws iam create-role \
		--role-name appdevexp-task-execution-role \
		--assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
		--description "ECS agent runtime — pull image, fetch secrets, write logs"
	aws iam attach-role-policy \
		--role-name appdevexp-task-execution-role \
		--policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
	aws iam put-role-policy \
		--role-name appdevexp-task-execution-role \
		--policy-name task-execution-extras \
		--policy-document file://$(TMP)/task-execution-policy.json

	@echo "Creating ECS task role..."
	aws iam create-role \
		--role-name appdevexp-$(APP_NAME)-task-role \
		--assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
		--description "App code runtime permissions for $(APP_NAME)"
	aws iam put-role-policy \
		--role-name appdevexp-$(APP_NAME)-task-role \
		--policy-name task-role \
		--policy-document file://$(TMP)/task-role-policy.json

	@echo "Done: runtime roles created"

bootstrap-all: bootstrap-boundary bootstrap-deployer bootstrap-service-roles bootstrap-runtime-roles ## Run all bootstrap steps in order (one-time setup)
	@echo "Bootstrap complete. Commit your state and let CI/CD manage from here."

# ============================================================
# Update — re-apply policies after editing .tpl files
# ============================================================
.PHONY: update-deployer update-ecs-role update-kms-role update-waf-role \
	update-logs-role update-s3-role update-task-execution-role \
	update-task-role update-permissions-boundary update-all-roles

update-deployer: render-backend-policy ## Re-apply backend policy to deployer role
	aws iam put-role-policy \
		--role-name $(DEPLOYER_ROLE) \
		--policy-name terraform-backend \
		--policy-document file://$(TMP)/terraform-backend-policy.json
	@echo "Updated: $(DEPLOYER_ROLE)"

update-ecs-role: render-ecs-policy ## Re-apply ECS deploy policy to ecs-deploy-role
	aws iam put-role-policy \
		--role-name appdevexp-ecs-deploy-role \
		--policy-name ecs-deploy \
		--policy-document file://$(TMP)/ecs-deploy-policy.json
	@echo "Updated: appdevexp-ecs-deploy-role"

update-kms-role: render-kms-policy ## Re-apply KMS policy to kms-manage-role
	aws iam put-role-policy \
		--role-name appdevexp-kms-manage-role \
		--policy-name kms-manage \
		--policy-document file://$(TMP)/kms-manage-policy.json
	@echo "Updated: appdevexp-kms-manage-role"

update-waf-role: render-waf-policy ## Re-apply WAF policy to waf-role
	aws iam put-role-policy \
		--role-name appdevexp-waf-role \
		--policy-name waf-manage \
		--policy-document file://$(TMP)/waf-policy.json
	@echo "Updated: appdevexp-waf-role"

update-logs-role: render-logs-policy ## Re-apply CloudWatch logs policy to logs-role
	aws iam put-role-policy \
		--role-name appdevexp-logs-role \
		--policy-name logs-manage \
		--policy-document file://$(TMP)/logs-policy.json
	@echo "Updated: appdevexp-logs-role"

update-s3-role: render-s3-policy ## Re-apply S3 policy to s3-manage-role
	aws iam put-role-policy \
		--role-name appdevexp-s3-manage-role \
		--policy-name s3-manage \
		--policy-document file://$(TMP)/s3-manage-policy.json
	@echo "Updated: appdevexp-s3-manage-role"

update-task-execution-role: render-task-execution-policy ## Re-apply extras policy to task-execution-role
	aws iam put-role-policy \
		--role-name appdevexp-task-execution-role \
		--policy-name task-execution-extras \
		--policy-document file://$(TMP)/task-execution-policy.json
	@echo "Updated: appdevexp-task-execution-role"

update-task-role: render-task-role-policy ## Re-apply task role policy to app task role
	aws iam put-role-policy \
		--role-name appdevexp-$(APP_NAME)-task-role \
		--policy-name task-role \
		--policy-document file://$(TMP)/task-role-policy.json
	@echo "Updated: appdevexp-$(APP_NAME)-task-role"

update-permissions-boundary: render-permissions-boundary ## Update permissions boundary policy to new version
	$(eval BOUNDARY_ARN := $(shell aws iam list-policies --query "Policies[?PolicyName=='appdevexp-permissions-boundary'].Arn" --output text))
	$(eval VERSION_ID   := $(shell aws iam list-policy-versions --policy-arn $(BOUNDARY_ARN) --query "Versions[?!IsDefaultVersion].VersionId" --output text))
	@if [ -n "$(VERSION_ID)" ]; then \
		aws iam delete-policy-version --policy-arn $(BOUNDARY_ARN) --version-id $(VERSION_ID); \
	fi
	aws iam create-policy-version \
		--policy-arn $(BOUNDARY_ARN) \
		--policy-document file://$(TMP)/permissions-boundary.json \
		--set-as-default
	@echo "Updated: appdevexp-permissions-boundary"

update-all-roles: update-deployer update-ecs-role update-kms-role update-waf-role update-logs-role update-s3-role update-task-execution-role update-task-role update-permissions-boundary ## Re-apply all inline policies to all roles
	@echo "All roles updated"

# ============================================================
# Verify — read back live policies from AWS for inspection
# ============================================================
.PHONY: verify-deployer verify-service-roles verify-runtime-roles verify-all

verify-deployer: ## Read back live deployer role policies from AWS
	@echo "=== $(DEPLOYER_ROLE) inline policies ==="
	aws iam get-role-policy \
		--role-name $(DEPLOYER_ROLE) \
		--policy-name terraform-backend \
		--query PolicyDocument --output json

verify-service-roles: ## Read back live service role policies from AWS
	@for role in ecs-deploy-role kms-manage-role waf-role logs-role s3-manage-role; do \
		echo "=== appdevexp-$$role ==="; \
		aws iam list-role-policies --role-name appdevexp-$$role --output text; \
	done

verify-runtime-roles: ## Read back live runtime role policies from AWS
	@echo "=== appdevexp-task-execution-role ==="
	aws iam list-attached-role-policies \
		--role-name appdevexp-task-execution-role --output table
	aws iam list-role-policies \
		--role-name appdevexp-task-execution-role --output text
	@echo "=== appdevexp-$(APP_NAME)-task-role ==="
	aws iam list-role-policies \
		--role-name appdevexp-$(APP_NAME)-task-role --output text

verify-all: verify-deployer verify-service-roles verify-runtime-roles ## Read back all live role policies from AWS

# ============================================================
# Destroy — remove all IAM roles and policies (destructive)
# ============================================================
.PHONY: destroy-service-roles destroy-runtime-roles \
	destroy-deployer destroy-boundary destroy-all

destroy-service-roles: ## [DESTRUCTIVE] Delete all ECS, KMS, WAF, Logs, and S3 service roles
	@echo "WARNING: Deleting all service roles..."
	@for role in ecs-deploy-role kms-manage-role waf-role logs-role s3-manage-role; do \
		echo "Deleting appdevexp-$$role..."; \
		policies=$$(aws iam list-role-policies --role-name appdevexp-$$role --query PolicyNames --output text 2>/dev/null); \
		for policy in $$policies; do \
			aws iam delete-role-policy --role-name appdevexp-$$role --policy-name $$policy; \
	done; \
	attached=$$(aws iam list-attached-role-policies --role-name appdevexp-$$role --query "AttachedPolicies[].PolicyArn" --output text 2>/dev/null); \
	for arn in $$attached; do \
		aws iam detach-role-policy --role-name appdevexp-$$role --policy-arn $$arn; \
	done; \
	aws iam delete-role --role-name appdevexp-$$role 2>/dev/null && echo "Deleted appdevexp-$$role" || echo "Skipped (not found): appdevexp-$$role"; \
	done

destroy-runtime-roles: ## [DESTRUCTIVE] Delete ECS task execution and app task roles
	@echo "WARNING: Deleting runtime roles..."
	@for role in task-execution-role $(APP_NAME)-task-role; do \
		echo "Deleting appdevexp-$$role..."; \
		policies=$$(aws iam list-role-policies --role-name appdevexp-$$role --query PolicyNames --output text 2>/dev/null); \
		for policy in $$policies; do \
			aws iam delete-role-policy --role-name appdevexp-$$role --policy-name $$policy; \
		done; \
		attached=$$(aws iam list-attached-role-policies --role-name appdevexp-$$role --query "AttachedPolicies[].PolicyArn" --output text 2>/dev/null); \
		for arn in $$attached; do \
			aws iam detach-role-policy --role-name appdevexp-$$role --policy-arn $$arn; \
		done; \
		aws iam delete-role --role-name appdevexp-$$role 2>/dev/null && echo "Deleted appdevexp-$$role" || echo "Skipped (not found): appdevexp-$$role"; \
	done

destroy-deployer: ## [DESTRUCTIVE] Delete the OIDC deployer role
	@echo "WARNING: Deleting deployer role..."
	aws iam delete-role-policy \
		--role-name $(DEPLOYER_ROLE) \
		--policy-name terraform-backend 2>/dev/null || true
	aws iam delete-role --role-name $(DEPLOYER_ROLE) 2>/dev/null \
		&& echo "Deleted $(DEPLOYER_ROLE)" || echo "Skipped (not found)"

destroy-boundary: ## [DESTRUCTIVE] Delete the permissions boundary policy
	@echo "WARNING: Deleting permissions boundary policy..."
	$(eval BOUNDARY_ARN := $(shell aws iam list-policies --query "Policies[?PolicyName=='appdevexp-permissions-boundary'].Arn" --output text))
	@if [ -n "$(BOUNDARY_ARN)" ]; then \
		versions=$$(aws iam list-policy-versions --policy-arn $(BOUNDARY_ARN) --query "Versions[?!IsDefaultVersion].VersionId" --output text); \
		for v in $$versions; do \
			aws iam delete-policy-version --policy-arn $(BOUNDARY_ARN) --version-id $$v; \
		done; \
		aws iam delete-policy --policy-arn $(BOUNDARY_ARN) && echo "Deleted boundary policy"; \
	else \
		echo "Skipped (not found): appdevexp-permissions-boundary"; \
	fi

destroy-all: destroy-service-roles destroy-runtime-roles destroy-deployer destroy-boundary ## [DESTRUCTIVE] Remove all IAM roles and boundary policy
	@echo "All IAM roles and policies removed"

# ============================================================
# Help
# ============================================================
.PHONY: roles-help
roles-help: ## ✨ show all roles commands
	@echo ""
	@echo "Usage: make <target> [VAR=value ...]"
	@echo ""
	@echo "Required variables:"
	@echo "  AWS_ACCOUNT_ID   TF_STATE_BUCKET   GITHUB_USER"
	@echo "  AWS_REGION       TF_LOCK_TABLE     REPO_NAME"
	@echo "  APP_NAME"
	@echo ""
	@echo "Render (produce JSON from .tpl):"
	@echo "  render-all-policies          Render all 11 policy files"
	@echo "  render-<name>                Render a single policy"
	@echo ""
	@echo "Bootstrap (one-time setup, run in order):"
	@echo "  bootstrap-boundary           Create permissions boundary policy"
	@echo "  bootstrap-deployer           Create OIDC deployer role"
	@echo "  bootstrap-service-roles      Create 5 service roles"
	@echo "  bootstrap-runtime-roles      Create task execution + task role"
	@echo "  bootstrap-all                Run all bootstrap steps in order"
	@echo ""
	@echo "Update (after editing .tpl files):"
	@echo "  update-all-roles             Re-apply all inline policies"
	@echo "  update-<role>                Re-apply a single role policy"
	@echo ""
	@echo "Verify:"
	@echo "  verify-all                   Read back live policies from AWS"
	@echo ""
	@echo "Destroy (destructive):"
	@echo "  destroy-all                  Remove all roles and boundary policy"
	@echo ""
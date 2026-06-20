# ==============================================================================
# AWS Secrets Manager bootstrap
#
# One-time, admin-only targets for creating application secrets.
# Passwords are read from $(SECRETS_ENV_FILE) — NEVER passed as CLI arguments
# (they would appear in process listings and shell history).
#
# Required variables (inherited from parent Makefile via .env / .env.public):
#   AWS_REGION, ADMIN_USER_NAME
#
# Run order:
#   make secrets-check       verify .env.secrets is complete
#   make secrets-bootstrap   create all secrets in Secrets Manager (one-time)
#   make secrets-verify      list ARNs to confirm (values not shown)
#
# To rotate a single secret after first bootstrap:
#   make secrets-rotate SECRET_NAME=/appdevexp/dev/mongo/admin
# ==============================================================================

SECRETS_ENV_FILE ?= .env.secrets

.PHONY: secrets-check secrets-bootstrap secrets-rotate secrets-verify secrets-help

# ── Validation ────────────────────────────────────────────────────────────────

secrets-check: ## 🔍 Verify .env.secrets exists and contains all required variables
	@if [ ! -f "$(SECRETS_ENV_FILE)" ]; then \
		echo ""; \
		echo "ERROR: $(SECRETS_ENV_FILE) not found."; \
		echo "Copy the example file and fill in real values:"; \
		echo "  cp .env.secrets.example $(SECRETS_ENV_FILE)"; \
		echo "  vim $(SECRETS_ENV_FILE)"; \
		echo ""; \
		exit 1; \
	fi
	@echo "Checking required variables in $(SECRETS_ENV_FILE)..."
	@for var in \
		MONGO_ADMIN_USERNAME \
		MONGO_ADMIN_PASSWORD \
		KEYCLOAK_ADMIN_USERNAME \
		KEYCLOAK_ADMIN_PASSWORD \
		POSTGRES_TOOLS_PASSWORD \
		GRAFANA_ADMIN_PASSWORD \
		UNLEASH_ADMIN_PASSWORD; do \
		if ! grep -q "^$$var=" "$(SECRETS_ENV_FILE)"; then \
			echo "ERROR: $$var is missing from $(SECRETS_ENV_FILE)"; \
			exit 1; \
		fi; \
		val=$$(grep "^$$var=" "$(SECRETS_ENV_FILE)" | cut -d= -f2-); \
		if [ -z "$$val" ]; then \
			echo "ERROR: $$var is present but empty in $(SECRETS_ENV_FILE)"; \
			exit 1; \
		fi; \
	done
	@echo "✅ $(SECRETS_ENV_FILE) is complete."

# ── Bootstrap (one-time, admin) ───────────────────────────────────────────────

secrets-bootstrap: secrets-check ## 🔐 Create all Secrets Manager entries (one-time, admin only)
	@echo "Creating secrets in region $(AWS_REGION) for environment dev..."
	@echo ""
	@set -a && . ./$(SECRETS_ENV_FILE) && set +a && \
	aws secretsmanager create-secret \
		--name "/appdevexp/dev/mongo/admin" \
		--description "MongoDB admin credentials for conference-manager dev" \
		--secret-string "{\"username\":\"$$MONGO_ADMIN_USERNAME\",\"password\":\"$$MONGO_ADMIN_PASSWORD\"}" \
		--region $(AWS_REGION) \
		--tags Key=project,Value=appdevexp Key=environment,Value=dev Key=managed_by,Value=makefile \
		2>/dev/null \
		&& echo "✅ Created /appdevexp/dev/mongo/admin" \
		|| echo "⚠️  /appdevexp/dev/mongo/admin already exists — use secrets-rotate to update"
	@set -a && . ./$(SECRETS_ENV_FILE) && set +a && \
	aws secretsmanager create-secret \
		--name "/appdevexp/dev/keycloak/admin" \
		--description "Keycloak bootstrap admin credentials for conference-manager dev" \
		--secret-string "{\"username\":\"$$KEYCLOAK_ADMIN_USERNAME\",\"password\":\"$$KEYCLOAK_ADMIN_PASSWORD\"}" \
		--region $(AWS_REGION) \
		--tags Key=project,Value=appdevexp Key=environment,Value=dev Key=managed_by,Value=makefile \
		2>/dev/null \
		&& echo "✅ Created /appdevexp/dev/keycloak/admin" \
		|| echo "⚠️  /appdevexp/dev/keycloak/admin already exists — use secrets-rotate to update"
	@set -a && . ./$(SECRETS_ENV_FILE) && set +a && \
	aws secretsmanager create-secret \
		--name "/appdevexp/dev/postgres/tools" \
		--description "PostgreSQL password for tools (Unleash + Keycloak + Grafana) in dev" \
		--secret-string "{\"password\":\"$$POSTGRES_TOOLS_PASSWORD\"}" \
		--region $(AWS_REGION) \
		--tags Key=project,Value=appdevexp Key=environment,Value=dev Key=managed_by,Value=makefile \
		2>/dev/null \
		&& echo "✅ Created /appdevexp/dev/postgres/tools" \
		|| echo "⚠️  /appdevexp/dev/postgres/tools already exists — use secrets-rotate to update"
	@set -a && . ./$(SECRETS_ENV_FILE) && set +a && \
	aws secretsmanager create-secret \
		--name "/appdevexp/dev/grafana/admin" \
		--description "Grafana local admin password fallback for conference-manager dev" \
		--secret-string "{\"adminPassword\":\"$$GRAFANA_ADMIN_PASSWORD\"}" \
		--region $(AWS_REGION) \
		--tags Key=project,Value=appdevexp Key=environment,Value=dev Key=managed_by,Value=makefile \
		2>/dev/null \
		&& echo "✅ Created /appdevexp/dev/grafana/admin" \
		|| echo "⚠️  /appdevexp/dev/grafana/admin already exists — use secrets-rotate to update"
	@set -a && . ./$(SECRETS_ENV_FILE) && set +a && \
	aws secretsmanager create-secret \
		--name "/appdevexp/dev/unleash/admin" \
		--description "Unleash default admin password for conference-manager dev" \
		--secret-string "{\"password\":\"$$UNLEASH_ADMIN_PASSWORD\"}" \
		--region $(AWS_REGION) \
		--tags Key=project,Value=appdevexp Key=environment,Value=dev Key=managed_by,Value=makefile \
		2>/dev/null \
		&& echo "✅ Created /appdevexp/dev/unleash/admin" \
		|| echo "⚠️  /appdevexp/dev/unleash/admin already exists — use secrets-rotate to update"
	@set -a && . ./$(SECRETS_ENV_FILE) && set +a && \
	aws secretsmanager create-secret \
		--name "/appdevexp/dev/keycloak/grafana-client-secret" \
		--description "Grafana OAuth client secret (generated in Keycloak after first boot)" \
		--secret-string "{\"secret\":\"placeholder-set-after-keycloak-first-boot\"}" \
		--region $(AWS_REGION) \
		--tags Key=project,Value=appdevexp Key=environment,Value=dev Key=managed_by,Value=makefile \
		2>/dev/null \
		&& echo "✅ Created /appdevexp/dev/keycloak/grafana-client-secret (placeholder — update after Keycloak boot)" \
		|| echo "⚠️  /appdevexp/dev/keycloak/grafana-client-secret already exists"
	@echo ""
	@echo "✅ Secrets bootstrap complete."
	@echo "   Run 'make secrets-verify' to list all created secrets."
	@echo ""
	@echo "   NOTE: /appdevexp/dev/keycloak/grafana-client-secret was created with a"
	@echo "   placeholder value. After Keycloak first boot, generate the Grafana client"
	@echo "   secret in the Keycloak admin console and run:"
	@echo "   make secrets-rotate SECRET_NAME=/appdevexp/dev/keycloak/grafana-client-secret"

# ── Rotation ──────────────────────────────────────────────────────────────────

secrets-rotate: ## 🔄 Rotate a secret. Usage: make secrets-rotate SECRET_NAME=/appdevexp/dev/mongo/admin NEW_VALUE='{"key":"value"}'
	@if [ -z "$(SECRET_NAME)" ]; then \
		echo "ERROR: SECRET_NAME is required."; \
		echo "Usage: make secrets-rotate SECRET_NAME=/appdevexp/dev/mongo/admin NEW_VALUE='{\"key\":\"value\"}'"; \
		exit 1; \
	fi
	@if [ -z "$(NEW_VALUE)" ]; then \
		echo "ERROR: NEW_VALUE is required (JSON string)."; \
		echo "Usage: make secrets-rotate SECRET_NAME=/appdevexp/dev/mongo/admin NEW_VALUE='{\"key\":\"value\"}'"; \
		exit 1; \
	fi
	aws secretsmanager put-secret-value \
		--secret-id "$(SECRET_NAME)" \
		--secret-string '$(NEW_VALUE)' \
		--region $(AWS_REGION)
	@echo "✅ Secret $(SECRET_NAME) updated."

# ── Verification ──────────────────────────────────────────────────────────────

secrets-verify: ## ✅ List secret ARNs under /appdevexp/dev/ (values are never shown)
	@echo "=== Secrets Manager entries for /appdevexp/dev/ ($(AWS_REGION)) ==="
	@aws secretsmanager list-secrets \
		--filter Key=name,Values=/appdevexp/dev/ \
		--region $(AWS_REGION) \
		--query 'SecretList[].{Name:Name,LastChanged:LastChangedDate}' \
		--output table

# ── Help ──────────────────────────────────────────────────────────────────────

secrets-help: ## ✨ Show all secrets management commands
	@echo ""
	@echo "Secrets Management — one-time admin setup"
	@echo ""
	@echo "  make secrets-check      Verify .env.secrets exists and all variables are set"
	@echo "  make secrets-bootstrap  Create all secrets in Secrets Manager (run once, admin)"
	@echo "  make secrets-verify     List existing secret names and last-changed date"
	@echo "  make secrets-rotate SECRET_NAME=<path> NEW_VALUE='{...}'  Update a secret value"
	@echo ""
	@echo "Required file (gitignored): .env.secrets"
	@echo "Template file (committed):  .env.secrets.example"
	@echo ""
	@echo "Who runs this:"
	@echo "  The AWS account owner / admin with secretsmanager:CreateSecret permission."
	@echo "  NOT the appdevexp-deployer OIDC role used by Terraform."
	@echo ""
	@echo "When to run:"
	@echo "  Once per environment before the first 'terraform apply'."
	@echo "  Re-run secrets-rotate if a password needs to be changed later."

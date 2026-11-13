.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

# Scaffolding a new service: copy a template from backend/ (see README.md
# "Scaffold a microservice" and the Knowledge MCP scaffold_guidance tool).
# The former create-* targets were removed in Phase 0 of
# docs/analysis/ade-scaffolding-and-knowledge-platform.md.

.PHONY: install-dependencies init-husky install-hooks lint-commit setup-commit-validation \
	devops-pr-cm-infra-verify devops-ci-cm-build-and-deploy \
	devops-pr-cm-changed-packages devops-all-tests help

install-dependencies: ## install node dependencies
	npm install

init-husky: ## init husky if not already initialized
	npx husky init

install-hooks: ## add commit-msg hook
	echo "npx --no -- commitlint --edit \\$$1" > .husky/commit-msg
	chmod +x .husky/commit-msg
	@echo "✅ commit-msg hook has been created and made executable."

lint-commit: ## check if a commit message is valid
	@echo "Checking last commit message..."
	@commitlint --from=HEAD~1 --to=HEAD

setup-commit-validation: install-dependencies init-husky install-hooks ## setup commit validation
	@echo "✅ Commit message validation is ready."

devops-all-tests: devops-pr-cm-changed-packages devops-ci-cm-build-and-deploy ## run all devops tests
	@echo "✅ All devops tests passed successfully."

devops-pr-cm-changed-packages: ## validate github actions for changed packages
	@echo "Validating GitHub Actions workflow for changed folder..."
	act -e devops/tests/events_simulate_changed_packages_conference_api.json -j get-changed-packages
	@echo "✅ GitHub Actions workflow for changed folder is valid."

devops-ci-cm-build-and-deploy: ## validate github actions for ci_conference_manager workflow
	@echo "Validating GitHub Actions workflow for ci_conference_manager..."
	act push -W .github/workflows/ci_cm_components.yml \
		-e devops/tests/events_simulate_push_conference_manager.json \
		-j conference-webapp-build-and-deploy \
		--var ENABLE_WEBAPP_DEPLOY=true
	@echo "✅ GitHub Actions workflow for ci_conference_manager is valid."

# Runs as 'pull_request' for all conference manager infrastructure
devops-pr-cm-infra-verify: ## validate github actions for conference-infra-verify pull request workflow
	@echo "Validating GitHub Actions workflow for conference infra verify..."
	@touch cloud/terraform/aws/.act-trigger
	act pull_request -e devops/tests/events_simulate_pull_request_conference_infra.json -j conference-infra-verify \
		|| (rm -f cloud/terraform/aws/.act-trigger && exit 1)
	@rm -f cloud/terraform/aws/.act-trigger
	@echo "✅ GitHub Actions workflow for conference infra verify is valid."

help:  ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-35s\033[0m %s\n", $$1, $$2}'
endif

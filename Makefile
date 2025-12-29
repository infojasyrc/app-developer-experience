.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

NODEJS_GQL_FOLDER_TEMPLATE = ms-nestjs-gql-tpl
NODEJS_NEW_GQL_SERVICE ?= ms-nodejs-gql-example

NODEJS_REST_FOLDER_TEMPLATE = ms-nestjs-rest-tpl
NODEJS_NEW_REST_SERVICE ?= ms-nodejs-rest-example

PY_FASTAPI_FOLDER_TEMPLATE = ms-fastapi-rest-tpl
PY_NEW_FASTAPI_SERVICE ?= ms-fastapi-example

OUT_FOLDER = examples

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

.PHONY: create-nodejs-gql create-nodejs-rest create-py-rest clean-examples \
	install-dependencies init-husky install-hooks lint-commit \
	setup-commit-validation validate-gh-actions-conference-manager-changed-packages \
	validate-gh-actions-release-backend-fastapi devops-gh-actions-conference-manager-api-verify \
	validate-gh-actions-conference-manager-api-verify help

create-nodejs-gql: clean-examples ## create a microservice with nodejs and graphql
	@if [ -z "$(NODEJS_NEW_GQL_SERVICE)" ]; then \
		echo "Error: NODEJS_NEW_GQL_SERVICE variable is not set"; \
		exit 1; \
	fi
	@echo "creating new microservice usign nodejs and graphql"
	@cp -r backend/$(NODEJS_GQL_FOLDER_TEMPLATE) "./$(OUT_FOLDER)/$(NODEJS_NEW_GQL_SERVICE)"
	@cd "./$(OUT_FOLDER)/$(NODEJS_NEW_GQL_SERVICE)" && \
		sed -i.bak 's/$(NODEJS_GQL_FOLDER_TEMPLATE)/$(NODEJS_NEW_GQL_SERVICE)/g' package.json package-lock.json && \
		rm package.json.bak package-lock.json.bak
	@echo "microservice created sucessfully at $(NODEJS_NEW_GQL_SERVICE)."

create-nodejs-rest: clean-examples ## create a microservice with nodejs and nestjs
	@if [ -z "$(NODEJS_NEW_REST_SERVICE)" ]; then \
		echo "Error: NODEJS_NEW_REST_SERVICE variable is not set"; \
		exit 1; \
	fi
	@echo "creating new rest microservice using nodejs and nestjs"
	@cp -r backend/$(NODEJS_REST_FOLDER_TEMPLATE) "./$(OUT_FOLDER)/$(NODEJS_NEW_REST_SERVICE)"
	@echo "microservice created sucessfully at $(NODEJS_NEW_REST_SERVICE)."

create-py-rest: clean-examples ## create a microservice with fastapi
	@if [ -z "$(PY_NEW_FASTAPI_SERVICE)" ]; then \
		echo "Error: PY_NEW_FASTAPI_SERVICE variable is not set"; \
		exit 1; \
	fi
	@echo "creating new gql microservice"
	@cp -r backend/$(PY_FASTAPI_FOLDER_TEMPLATE) "./$(OUT_FOLDER)/$(PY_NEW_FASTAPI_SERVICE)"
	@echo "microservice created sucessfully at $(PY_NEW_FASTAPI_SERVICE)."

clean-examples: ## clean previous examples
	@echo "cleanning previous examples"
	@find ./$(OUT_FOLDER) -type d -name "$(NODEJS_NEW_GQL_SERVICE)" -exec rm -rf {} +
	@find ./$(OUT_FOLDER) -type d -name "$(NODEJS_NEW_REST_SERVICE)" -exec rm -rf {} +
	@find ./$(OUT_FOLDER) -type d -name "$(PY_NEW_FASTAPI_SERVICE)" -exec rm -rf {} +
	@echo "removed previous examples"

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

validate-gh-actions-conference-manager-changed-packages: ## validate github actions for changed packages
	@echo "Validating GitHub Actions workflow for changed folder..."
	act -e devops/tests/events_simulate_changed_packages_conference_api.json -j get-changed-packages
	@echo "✅ GitHub Actions workflow for changed folder is valid."

validate-gh-actions-release-backend-fastapi: ## validate github actions for release backend fastapi
	@echo "Validating GitHub Actions workflow for release backend fastapi..."
	act -e devops/tests/events_simulate_release_fastapi_tpl.json -j release-fastapi-rest-tpl
	@echo "✅ GitHub Actions workflow for release backend fastapi is valid."

# runs as 'push'
validate-gh-actions-conference-manager-api-verify: ## deprecated validate github actions for conferenceapi-verify
	@echo "Validating GitHub Actions workflow for conference api verify..."
	act -e devops/tests/events_simulate_pull_request_conference_api.json -j conference-api-verify
	@echo "✅ GitHub Actions workflow for conference api verify is valid."

# runs as 'pull_request'
devops-gh-actions-conference-manager-api-verify: ## validate github actions for conferenceapi-verify
	@echo "Validating GitHub Actions workflow for conference api verify..."
	act pull_request -e devops/tests/events_simulate_pull_request_conference_api.json -j conference-api-verify
	@echo "✅ GitHub Actions workflow for conference api verify is valid."

help:  ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif
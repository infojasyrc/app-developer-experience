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

.PHONY: create-nodejs-gql
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

.PHONY: create-nodejs-rest
create-nodejs-rest: clean-examples ## create a microservice with nodejs and nestjs
	@if [ -z "$(NODEJS_NEW_REST_SERVICE)" ]; then \
		echo "Error: NODEJS_NEW_REST_SERVICE variable is not set"; \
		exit 1; \
	fi
	@echo "creating new rest microservice using nodejs and nestjs"
	@cp -r backend/$(NODEJS_REST_FOLDER_TEMPLATE) "./$(OUT_FOLDER)/$(NODEJS_NEW_REST_SERVICE)"
	@echo "microservice created sucessfully at $(NODEJS_NEW_REST_SERVICE)."

.PHONY: create-py-rest
create-py-rest: clean-examples ## create a microservice with fastapi
	@if [ -z "$(PY_NEW_FASTAPI_SERVICE)" ]; then \
		echo "Error: PY_NEW_FASTAPI_SERVICE variable is not set"; \
		exit 1; \
	fi
	@echo "creating new gql microservice"
	@cp -r backend/$(PY_FASTAPI_FOLDER_TEMPLATE) "./$(OUT_FOLDER)/$(PY_NEW_FASTAPI_SERVICE)"
	@echo "microservice created sucessfully at $(PY_NEW_FASTAPI_SERVICE)."

.PHONY: clean-examples
clean-examples: ## clean previous examples
	@echo "cleanning previous examples"
	@find ./$(OUT_FOLDER) -type d -name "$(NODEJS_NEW_GQL_SERVICE)" -exec rm -rf {} +
	@find ./$(OUT_FOLDER) -type d -name "$(NODEJS_NEW_REST_SERVICE)" -exec rm -rf {} +
	@find ./$(OUT_FOLDER) -type d -name "$(PY_NEW_FASTAPI_SERVICE)" -exec rm -rf {} +
	@echo "removed previous examples"

.PHONY: install-dependencies
install-dependencies: ## install node dependencies
	npm install

.PHONY: init-husky
init-husky: ## init husky if not already initialized
	npx husky init

.PHONY: install-hooks
install-hooks: ## add commit-msg hook
	echo "npx --no -- commitlint --edit \\$$1" > .husky/commit-msg
	chmod +x .husky/commit-msg
	@echo "✅ commit-msg hook has been created and made executable."

.PHONY: lint-commit
lint-commit: ## check if a commit message is valid
	@echo "Checking last commit message..."
	@commitlint --from=HEAD~1 --to=HEAD

.PHONY: setup-commit-validation
setup-commit-validation: install-dependencies init-husky install-hooks ## setup commit validation
	@echo "✅ Commit message validation is ready."

.PHONY: help
help:  ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif
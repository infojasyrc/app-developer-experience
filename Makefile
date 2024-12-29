.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

GQL_FOLDER_TEMPLATE = ms-nestjs-gql-tpl
NEW_GQL_SERVICE ?= ms-gql-example

FASTAPI_FOLDER_TEMPLATE = ms-fastapi-rest-tpl
NEW_FASTAPI_SERVICE ?= ms-fastapi-example

OUT_FOLDER = examples

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

.PHONY: create-gql
create-gql: clean-example ## create a ms gql for bff microservice
	@if [ -z "$(NEW_GQL_SERVICE)" ]; then \
		echo "Error: NEW_GQL_SERVICE variable is not set"; \
		exit 1; \
	fi
	@echo "creating new gql microservice"
	@cp -r $(GQL_FOLDER_TEMPLATE) "./$(OUT_FOLDER)/$(NEW_GQL_SERVICE)"
	@cd "./$(OUT_FOLDER)/$(NEW_GQL_SERVICE)" && \
		sed -i.bak 's/$(GQL_FOLDER_TEMPLATE)/$(NEW_GQL_SERVICE)/g' package.json package-lock.json && \
		rm package.json.bak package-lock.json.bak
	@echo "microservice created sucessfully at $(NEW_GQL_SERVICE)."

.PHONY: create-rest-py-fastapi
create-rest-py-fastapi: clean-example ## create a microservice with fastapi
	@if [ -z "$(NEW_FASTAPI_SERVICE)" ]; then \
		echo "Error: NEW_FASTAPI_SERVICE variable is not set"; \
		exit 1; \
	fi
	@echo "creating new gql microservice"
	@cp -r $(FASTAPI_FOLDER_TEMPLATE) "./$(OUT_FOLDER)/$(NEW_FASTAPI_SERVICE)"
	@echo "microservice created sucessfully at $(NEW_FASTAPI_SERVICE)."

.PHONY: clean-examples
clean-examples: ## clean previous examples
	@echo "cleanning previous examples"
	@find ./$(OUT_FOLDER) -type d -name "$(NEW_GQL_SERVICE)" -exec rm -rf {} +
	@find ./$(OUT_FOLDER) -type d -name "$(NEW_FASTAPI_SERVICE)" -exec rm -rf {} +
	@echo "removed previous examples"

.PHONY: help
help:  ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif
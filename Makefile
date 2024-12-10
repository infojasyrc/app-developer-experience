.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

IMAGE_NAME = ms-nestjs-template
GQL_FOLDER_TEMPLATE = ms-nestjs-gql-template
NEW_GQL_SERVICE ?= ms-gql-example

OUT_FOLDER = examples

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

.PHONY: create-gql
create-gql: clean-example ## create a ms gql for bff microservice
	@if [ -z "$(NEW_GQL_SERVICE)" ]; then \
		echo "Error: GQL_FOLDER_TEMPLATE variable is not set"; \
		exit 1; \
	fi
	@echo "creating new gql microservice"
	@cp -r $(GQL_FOLDER_TEMPLATE) "./$(OUT_FOLDER)/$(NEW_GQL_SERVICE)"
	@cd "./$(OUT_FOLDER)/$(NEW_GQL_SERVICE)" && \
		sed -i.bak 's/$(GQL_FOLDER_TEMPLATE)/$(NEW_GQL_SERVICE)/g' package.json package-lock.json && \
		rm package.json.bak package-lock.json.bak
	@echo "microservice created sucessfully at $(NEW_GQL_SERVICE)."

.PHONY: clean-example
clean-example: ## clean previous example
	@echo "cleanning previous example $(NEW_GQL_SERVICE)"
	@find ./$(OUT_FOLDER) -type d -name "$(NEW_GQL_SERVICE)" -exec rm -rf {} +
	@echo "removed previous example"

.PHONY: help
help:  ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif
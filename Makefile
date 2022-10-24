.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands
IMAGE_NAME = ms-nestjs-template

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

.PHONY: build
build: ## build docker image
	docker build -t $(IMAGE_NAME) .

.PHONY: interactive
interactive: ## get a bash shell in the container
	docker run -it -p 8080:3000 $(IMAGE_NAME)

.PHONY: help
help:  ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif
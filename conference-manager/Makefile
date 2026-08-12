# .env.public for common environment variables
ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

DB_URL     = mongodb://$(DB_ROOT_USERNAME):$(DB_ROOT_PASSWORD)@localhost:$(DB_PORT)/?authSource=admin
DEFAULT_DB = mongodb

PROJECT_NAME         := $(PROJECT_NAME)
COMPOSE_PROJECT_NAME := $(COMPOSE_PROJECT_NAME)
# Available platforms: linux/amd64 | linux/arm64 | linux/x86_64
PLATFORM := $(PLATFORM)

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

.PHONY: help
help: ## ❓ Show Conference Manager root + component targets
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort -u | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif

.PHONY: docker-clean build-all launch stop help

docker-clean: ## stop+kill all running containers. prune stopped containers. remove all untagged images
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach-object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill; docker container prune --force; docker system prune --force;
endif

build-all: webapp-build-prod api-build-prod ## build all component images for production

launch: docker-clean ## launch all components for local development
	docker compose --env-file $(ENV_FILE) -f ms-conference-api/docker-compose/docker-compose.db.yml \
		-f ms-conference-api/docker-compose/docker-compose.unleash.yml \
		-f ms-conference-api/docker-compose/docker-compose.local.dev.api.yml \
		-f docker-compose/docker-compose.local.dev.web.yml up

stop: ## stop application for local development
	docker compose --env-file $(ENV_FILE) -f ms-conference-api/docker-compose/docker-compose.db.yml \
		-f ms-conference-api/docker-compose/docker-compose.unleash.yml \
		-f ms-conference-api/docker-compose/docker-compose.local.dev.api.yml \
		-f docker-compose/docker-compose.local.dev.web.yml down
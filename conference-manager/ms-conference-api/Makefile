## Makefile for ms-conference-api (API service tasks)
## Conventions: targets use hyphenated verbs, documented with '##' for help discovery.

# .env.public for common environment variables (fallback when .env absent)
ENV_FILE                 = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")
include $(ENV_FILE)

.DEFAULT_GOAL            := help

LOCAL_APP_FOLDER         = /usr/src/app
CONTAINER_APP_FOLDER     = /app

DB_URL                   = mongodb://$(DB_ROOT_USERNAME):$(DB_ROOT_PASSWORD)@localhost:$(DB_PORT)/?authSource=admin
DEFAULT_DB               = mongodb
TOKEN_SCRIPT_FILE        = scripts/firebase-auth-test

PROJECT_NAME             = conference-manager
COMPOSE_PROJECT_NAME     := $(COMPOSE_PROJECT_NAME)
DOCKER_COMPOSE           = docker compose
PLATFORM                 := $(PLATFORM)

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

# include dependencies and codebase to a container excluding local dependencies that could conflict with one from volumes
DEV_VOLUME_API = \
	-v $(DIR):$(LOCAL_APP_FOLDER) \
	-v $(LOCAL_APP_FOLDER)/node_modules \
	-v $(COMPOSE_PROJECT_NAME)-api-packages:$(LOCAL_APP_FOLDER)/node_modules

# Centralized phony target list (discovery + reduces duplication)
.PHONY: help docker-clean build-dev build-api get-token interactive install-dependencies audit-fix-dependencies lint unit-tests unit-tests-v1 unit-tests-v2 launch-db stop-db launch-local-dev stop-local-dev launch-local-prod stop-local-prod

docker-clean: ## ❌ Stop & prune all containers/images (DANGEROUS)
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach-object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill || true; docker container prune --force; docker system prune --force;
endif

build-dev: ## 🛠️ Build development container image for API
	docker build --platform $(PLATFORM) --target development \
		-t $(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev .

build-prod: ## 🛠️ Build production container image for API
	docker build --platform $(PLATFORM) \
		-t $(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api .

get-token: ## 🔐 Retrieve Firebase auth token (ROLE=admin|user) Usage: make get-token ROLE=admin
	node $(TOKEN_SCRIPT_FILE) $(ROLE)

interactive: ## 🚀 Run API standalone (healthcheck only, no DB)
	docker run -it --rm --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		-p "${MS_PORT}:${MS_PORT}" \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash

install-dependencies: ## 📦 Install node packages into dev volume
	docker run -t --rm --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn install"

audit-fix-dependencies: ## 🔍 Audit & fix critical/high vulnerabilities
	docker run -t --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -c "yarn run security:audit && yarn run security:fix"

lint: ## 🧪 Run lint checks
	docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn run lint"

unit-tests: unit-tests-v1 unit-tests-v2 ## 🧪 Run all unit test suites (AVA + Jest)

unit-tests-v1: ## 🧪 Run AVA unit tests (v1 legacy)
	docker run -it --rm --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn run test:unit-tests:v1"

unit-tests-v2: ## 🧪 Run Jest unit tests (v2 NestJS)
	docker run -it --rm --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn run test:unit-tests:v2"

launch-db: docker-clean ## 🗄️ Launch MongoDB container locally
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml up

stop-db: ## 🛑 Stop local MongoDB container
	$(DOCKER_COMPOSE) --env-file=$(ENV_FILE) -f docker-compose/docker-compose.db.yml down

launch-local-dev: ## 🚀 Launch API + DB (development stack)
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.dev.api.yml up

stop-local-dev: ## 🛑 Stop development stack
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.dev.api.yml down

launch-local-prod: docker-clean ## 🚀 Launch production-like stack locally
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.api.yml up

stop-local-prod: ## 🛑 Stop production-like local stack
	$(DOCKER_COMPOSE) --env-file=$(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.api.yml down

help: ## List available make targets
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -hE '^[a-zA-Z0-9_.-]+:.*##' $(MAKEFILE_LIST) | awk -F':|##' '{printf "\033[36m%-30s\033[0m %s\n", $$1, $$3}' | sort
endif

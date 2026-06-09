## Makefile for ms-conference-api (API service tasks)
## Conventions: targets use hyphenated verbs, documented with '##' for help discovery.

# .env.public for common environment variables (fallback when .env absent)
ENV_FILE                 = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")
include $(ENV_FILE)

.DEFAULT_GOAL            := help

LOCAL_APP_FOLDER         = /usr/src/app

DB_URL                   = mongodb://$(DB_ROOT_USERNAME):$(DB_ROOT_PASSWORD)@localhost:$(DB_PORT)/?authSource=admin
DEFAULT_DB               = mongodb
TOKEN_SCRIPT_FILE        = ./scripts/get-token.sh

PROJECT_NAME             := $(PROJECT_NAME)
COMPOSE_PROJECT_NAME     := $(COMPOSE_PROJECT_NAME)
DOCKER_COMPOSE           = docker compose
PLATFORM                 := $(PLATFORM)
# For CI
IMAGE_NAME               ?= $(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api
IMAGE_TAG                ?= latest

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
.PHONY: help docker-clean build-dev build-prod get-token interactive create-volumes install-dependencies \
	audit-fix-dependencies lint unit-tests unit-tests-v2 watch-unit-tests-v2 \
	launch-db stop-db launch-local-dev stop-local-dev launch-local-prod stop-local-prod \
	launch-unleash stop-unleash reset-unleash seed-data clear-data reset-db

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
		-t $(IMAGE_NAME):$(IMAGE_TAG) .

seed-data: ## 🌱 Seed users, headquarters and conferences directly via services (dev only)
	docker run -t --rm --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		--network $(COMPOSE_PROJECT_NAME)-network \
		--env-file .env \
		-e DB_HOST=$(COMPOSE_PROJECT_NAME)-db \
		$(DEV_VOLUME_API) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn seed"

clear-data: ## 🗑️ Remove all seeded users, headquarters and conferences (dev only)
	docker run -t --rm --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		--network $(COMPOSE_PROJECT_NAME)-network \
		--env-file .env \
		-e DB_HOST=$(COMPOSE_PROJECT_NAME)-db \
		$(DEV_VOLUME_API) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn clear"

get-token: ## 🔐 Retrieve Firebase auth token (ROLE=admin|user) Usage: make get-token ROLE=admin
	@if [ -z "$(EMAIL)" ] || [ -z "$(PASSWORD)" ]; then \
		echo "Error: EMAIL and PASSWORD must be set. Usage: make get-token EMAIL=your-email PASSWORD=your-password"; \
		exit 1; \
	fi;
	$(TOKEN_SCRIPT_FILE) $(EMAIL) $(PASSWORD)

interactive: ## 🚀 Run API standalone (healthcheck only, no DB)
	docker run -it --rm --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		-p "${MS_PORT}:${MS_PORT}" \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash

create-volumes: ## 📦 Create external container volume for node_modules (run once before first use)
	docker volume create $(COMPOSE_PROJECT_NAME)-api-packages

install-dependencies: ## 📦 Install node packages into dev volume
	docker run -t --rm --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn install"

audit-fix-dependencies: ## 🔍 Audit & fix critical/high vulnerabilities
	docker run -t --rm --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -c "yarn run security:audit && yarn run security:fix"

lint: ## 🧹 Run lint checks
	docker run -t --rm --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn run lint"

unit-tests: unit-tests-v2 ## 🧪 Run all unit tests (Jest)

unit-tests-v2: ## 🧪 Run Jest unit tests (v2 NestJS)
	docker run -t --rm --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn run test:unit-tests:v2"

watch-unit-tests-v2: ## 🧪 Run Jest unit tests in watch mode (v2 NestJS)
	docker run -it --rm --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn run test:watch:v2"

launch-unleash: ## 🚀 Launch feature toggles with unleash
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.unleash.yml up

stop-unleash: ## 🛑 Stop feature toggle service
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.unleash.yml down

reset-unleash: ## 🗑️ Stop unleash and remove its volume (required after upgrading postgres major version)
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.unleash.yml down -v

launch-db: ## 🗄️ Launch MongoDB container locally
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml up

stop-db: ## 🛑 Stop local MongoDB container
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml down

reset-db: ## 🗑️ Stop MongoDB and wipe its data volume — clears stale indexes (dev only)
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml down -v

launch-local-dev: ## 🚀 Launch API + DB + Feature Toogles (development stack)
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.unleash.yml \
		-f docker-compose/docker-compose.local.dev.api.yml up

stop-local-dev: ## 🛑 Stop development stack
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.unleash.yml \
		-f docker-compose/docker-compose.local.dev.api.yml down

launch-local-prod: ## 🚀 Launch production-like stack locally
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.api.yml up

stop-local-prod: ## 🛑 Stop production-like local stack
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.api.yml down

help: ## List available make targets
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -hE '^[a-zA-Z0-9_.-]+:.*##' $(MAKEFILE_LIST) | awk -F':|##' '{printf "\033[36m%-30s\033[0m %s\n", $$1, $$3}' | sort
endif

# .env.public for common environment variables
ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

DB_URL     = mongodb://$(DB_ROOT_USERNAME):$(DB_ROOT_PASSWORD)@localhost:$(DB_PORT)/?authSource=admin
DEFAULT_DB = mongodb

PROJECT_NAME         := $(PROJECT_NAME)
COMPOSE_PROJECT_NAME := $(COMPOSE_PROJECT_NAME)
# Available platforms: linux/amd64 | linux/arm64/v8 | linux/x86_64 | linux/arm/v7
PLATFORM := $(PLATFORM)

MS_ADMIN_FOLDER      := ms-conference-admin

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

DEV_VOLUME_ADMIN = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/.venv \
	-v $(COMPOSE_PROJECT_NAME)-admin-packages:$(CONTAINER_APP_FOLDER)/.venv

.PHONY: help
help: ## ❓ Show Conference Manager root + component targets
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort -u | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@# Also show proxied webapp targets (prefixed with "webapp-")
	@if [ -f ms-conference-webapp/Makefile ]; then \
		grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' ms-conference-webapp/Makefile | \
		sort -u | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", "webapp-" $$1, $$2}'; \
	fi
	@# Also show proxied api targets (prefixed with "api-")
	@if [ -f ms-conference-api/Makefile ]; then \
		grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' ms-conference-api/Makefile | \
		sort -u | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", "api-" $$1, $$2}'; \
	fi
endif

.PHONY: docker-clean build-dev-admin build-admin interactive-admin install-dependencies-admin launch-db stop-db \
	launch-api-local stop-api-local launch-admin-local stop-admin-local \
	launch-api-dev stop-api-dev launch-admin-dev stop-admin-dev \
	launch-webapp-dev stop-webapp-dev webapp-% api-% build-all

docker-clean: ## stop+kill all running containers. prune stopped containers. remove all untagged images
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach-object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill; docker container prune --force; docker system prune --force;
endif

# --- Frontend Delegation ---
# Forward webapp targets safely without importing all symbols
webapp-%: ## Run webapp make target (e.g., webapp-build-dev)
	@make -C ms-conference-webapp $*

# --- Backend Delegation ---
# Forward api targets safely without importing all symbols
api-%: ## Run api make target (e.g., api-build-dev)
	@make -C ms-conference-api $*

build-all: webapp-build-prod api-build-prod ## build all component images for production

build-dev-admin: ## build container image for admin local development
	cd ./$(MS_ADMIN_FOLDER); docker build --platform $(PLATFORM) --target build \
		-t $(COMPOSE_PROJECT_NAME)-admin-dev .

build-admin: ## build container image for admin local development
	cd ./$(MS_ADMIN_FOLDER); docker build --platform $(PLATFORM) \
		-t $(COMPOSE_PROJECT_NAME)-admin .

interactive-admin: ## get a bash shell in the container
	cd ./$(MS_ADMIN_FOLDER); docker run -it --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_ADMIN) \
		--env PATH="/app/.venv/bin:$PATH" \
		--env PIPENV_PIPFILE=/app/Pipfile \
		--env DB_ROOT_USERNAME=$(DB_ROOT_USERNAME) \
		--env DB_ROOT_PASSWORD=$(DB_ROOT_PASSWORD) \
		--env DB_HOST=localhost \
		--env DB_PORT=$(DB_PORT) \
		--env DEFAULT_DB=$(DEFAULT_DB) \
		$(COMPOSE_PROJECT_NAME)-admin-dev /bin/ash

install-dependencies-admin: ## install packages from pipfile
	cd ./$(MS_ADMIN_FOLDER); docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_ADMIN) \
		$(COMPOSE_PROJECT_NAME)-admin-dev /bin/ash -ci "pipenv install --dev"

# .PHONY: run-tests-admin
# run-admin-tests: ## run integration tests against admin microservice
# 	cd ./$(MS_ADMIN_FOLDER); docker run -t --net=$(COMPOSE_PROJECT_NAME)-admin-network \
# 		--workdir="$(CONTAINER_APP_FOLDER)/src" \
# 		$(DEV_VOLUME_ADMIN) \
# 		--platform $(PLATFORM) \
# 		$(COMPOSE_PROJECT_NAME)-admin-dev /bin/ash -ci "pipenv run python -m pytest tests/"

launch-admin-local: ## launch application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.admin.yml up

stop-admin-local: ## stop application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.admin.yml down

launch-admin-dev: ## launch application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.dev.admin.yml up

stop-admin-dev: ## stop application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.dev.admin.yml down

launch-local-dev: docker-clean ## launch all components for local development
	docker compose --env-file $(ENV_FILE) -f ms-conference-api/docker-compose/docker-compose.db.yml \
		-f ms-conference-api/docker-compose/docker-compose.unleash.yml \
		-f ms-conference-api/docker-compose/docker-compose.local.dev.api.yml \
		-f docker-compose/docker-compose.local.dev.web.yml up

stop-local-dev: ## stop application for local development
	docker compose --env-file $(ENV_FILE) -f ms-conference-api/docker-compose/docker-compose.db.yml \
		-f ms-conference-api/docker-compose/docker-compose.unleash.yml \
		-f ms-conference-api/docker-compose/docker-compose.local.dev.api.yml \
		-f docker-compose/docker-compose.local.dev.web.yml down
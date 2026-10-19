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

DOCKER_COMPOSE  = docker compose
# Shared MongoDB lives in ../shared-services (shared with ms-conference-api)
SHARED_SERVICES = ../shared-services

CONTAINER_APP_FOLDER := /app

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

DEV_VOLUME = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/.venv \
	-v $(COMPOSE_PROJECT_NAME)-admin-packages:$(CONTAINER_APP_FOLDER)/.venv

DEV_ENV = \
	-e PYTHONPATH=$(CONTAINER_APP_FOLDER)/src \
	-e DB_HOST=localhost \
	-e DB_PORT=$(DB_PORT) \
	-e DEFAULT_DB=$(DEFAULT_DB)

.PHONY: help
help: ## ❓ Show Conference Manager root + component targets
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort -u | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif

.PHONY: docker-clean build-dev build-prod interactive create-network create-volumes install-dependencies \
	lint format unit-tests launch-db stop-db reset-db launch-local stop-local launch-prod stop-prod \
	create-super-user logs help

docker-clean: ## stop+kill all running containers. prune stopped containers. remove all untagged images
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach-object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill; docker container prune --force; docker system prune --force;
endif

build-dev: ## build container image for local development
	docker build --platform $(PLATFORM) --target dev \
		-t $(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-admin-dev .

build-prod: ## build container image for production
	docker build --platform $(PLATFORM) --target prod \
		-t $(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-admin .

interactive: ## get a bash shell in the container
	docker run -it --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		--env PATH="/app/.venv/bin:$$PATH" \
		--env DB_ROOT_USERNAME=$(DB_ROOT_USERNAME) \
		--env DB_ROOT_PASSWORD=$(DB_ROOT_PASSWORD) \
		--env DB_HOST=localhost \
		--env DB_PORT=$(DB_PORT) \
		--env DEFAULT_DB=$(DEFAULT_DB) \
		$(COMPOSE_PROJECT_NAME)-admin-dev /bin/ash -c "source .venv/bin/activate && exec ash"

create-network: ## create shared container network if it does not exist
	@$(MAKE) --no-print-directory -C $(SHARED_SERVICES) create-network

create-volumes: ## create external container volumes (incl. shared network + DB volume) if they do not exist
	@$(MAKE) --no-print-directory -C $(SHARED_SERVICES) create-volumes
	@docker volume inspect $(COMPOSE_PROJECT_NAME)-admin-packages >/dev/null 2>&1 || \
		(echo "Creating volume: $(COMPOSE_PROJECT_NAME)-admin-packages" && docker volume create $(COMPOSE_PROJECT_NAME)-admin-packages)

launch-db: ## launch shared MongoDB (idempotent, shared with ms-conference-api)
	@$(MAKE) --no-print-directory -C $(SHARED_SERVICES) launch-db

stop-db: ## stop shared MongoDB (also affects ms-conference-api)
	@$(MAKE) --no-print-directory -C $(SHARED_SERVICES) stop-db

reset-db: ## stop shared MongoDB and wipe its data volume (dev only, also affects ms-conference-api)
	@$(MAKE) --no-print-directory -C $(SHARED_SERVICES) reset-db

install-dependencies: ## install uv packages into the container volume
	docker run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-admin-dev /bin/ash -c "uv lock && uv sync --group dev"

lint: ## run linters inside the container
	docker run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-admin-dev /bin/ash -c "uv run black --check src && uv run isort --check-only src && uv run flake8 src"

format: ## auto-format source with black and isort
	docker run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-admin-dev /bin/ash -c "uv run black src && uv run isort src"

unit-tests: ## run unit tests with coverage
	docker run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-admin-dev /bin/ash -c "uv run pytest"

launch-local: launch-db ## launch application for local development (with shared DB)
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.local.yml up -d

create-super-user: ## create a Django admin superuser (requires make launch-local)
	docker exec -it -w $(CONTAINER_APP_FOLDER)/src $(COMPOSE_PROJECT_NAME)-admin-dev \
		/bin/ash -c "uv run --no-sync python manage.py createsuperuser"

stop-local: ## stop application for local development (shared DB keeps running)
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.local.yml down

launch-prod: launch-db ## launch production image locally (with shared DB)
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.prod.yml up -d

stop-prod: ## stop production image locally (shared DB keeps running)
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.prod.yml down

logs: ## show logs for local development
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.local.yml logs -f

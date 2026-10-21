ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

CONTAINER_RUNTIME ?= docker
ifeq ($(filter $(CONTAINER_RUNTIME),docker podman container),)
$(error CONTAINER_RUNTIME must be docker, podman, or container)
endif

.DEFAULT_GOAL := help

COMPOSE_PROJECT_NAME ?= fastapi-rest-tpl
CONTAINER_APP_FOLDER = /app
PLATFORM := $(PLATFORM)
IMAGE_DEV = $(COMPOSE_PROJECT_NAME)-dev
IMAGE_PROD = $(COMPOSE_PROJECT_NAME)

PACKAGE_DIR := $(abspath .)

DIR := $(PACKAGE_DIR)

DEV_VOLUME = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/.venv \
	-v $(COMPOSE_PROJECT_NAME)-packages:$(CONTAINER_APP_FOLDER)/.venv

DEV_ENV = \
	-e PYTHONPATH=$(CONTAINER_APP_FOLDER)/src

.PHONY: docker-clean build-dev build-prod install-dependencies lint unit-tests \
	create-volumes launch-local stop-local interactive help

docker-clean: ## stop and kill all running containers
	@ids=$$($(CONTAINER_RUNTIME) ps -qa); \
	if [ -n "$$ids" ]; then printf '%s\n' $$ids | xargs $(CONTAINER_RUNTIME) kill; fi; \
	$(CONTAINER_RUNTIME) container prune --force; \
	$(CONTAINER_RUNTIME) system prune --force

build-dev: ## build docker image for local development
	$(CONTAINER_RUNTIME) build --platform $(PLATFORM) --target dev \
		-t $(IMAGE_DEV) .

build-prod: ## build docker image for production
	$(CONTAINER_RUNTIME) build --platform $(PLATFORM) --target prod \
		-t $(IMAGE_PROD) .

install-dependencies: ## install uv packages into the container volume
	$(CONTAINER_RUNTIME) run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(IMAGE_DEV) /bin/ash -c "uv lock && uv sync --group dev"

lint: ## run linters inside the container
	$(CONTAINER_RUNTIME) run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/ash -c "uv run black --check src tests && uv run isort --check-only src tests && uv run flake8 src tests"

unit-tests: ## run unit tests with coverage
	$(CONTAINER_RUNTIME) run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/ash -c "uv run pytest"

create-volumes: ## create external container volumes if they do not exist
	@echo "Checking and creating external volumes..."
	@$(CONTAINER_RUNTIME) volume inspect $(COMPOSE_PROJECT_NAME)-db-data >/dev/null 2>&1 || \
		(echo "Creating volume: $(COMPOSE_PROJECT_NAME)-db-data" && $(CONTAINER_RUNTIME) volume create $(COMPOSE_PROJECT_NAME)-db-data)
	@$(CONTAINER_RUNTIME) volume inspect $(COMPOSE_PROJECT_NAME)-packages >/dev/null 2>&1 || \
		(echo "Creating volume: $(COMPOSE_PROJECT_NAME)-packages" && $(CONTAINER_RUNTIME) volume create $(COMPOSE_PROJECT_NAME)-packages)

launch-local: ## launch application for local development
	$(CONTAINER_RUNTIME) compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.yml up

stop-local: ## stop application for local development
	$(CONTAINER_RUNTIME) compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.yml down

interactive: ## open a shell inside the container
	$(CONTAINER_RUNTIME) run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/ash -c "source .venv/bin/activate && exec ash"

help: ## show all make commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

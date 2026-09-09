ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := help

COMPOSE_PROJECT_NAME ?= fastapi-rest-tpl
CONTAINER_APP_FOLDER = /app
PLATFORM := $(PLATFORM)
IMAGE_DEV = $(COMPOSE_PROJECT_NAME)-dev
IMAGE_PROD = $(COMPOSE_PROJECT_NAME)

PACKAGE_DIR := $(abspath .)

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := $(PACKAGE_DIR)
endif

DEV_VOLUME = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/.venv \
	-v $(COMPOSE_PROJECT_NAME)-packages:$(CONTAINER_APP_FOLDER)/.venv

DEV_ENV = \
	-e PYTHONPATH=$(CONTAINER_APP_FOLDER)/src

.PHONY: docker-clean build-dev build-prod install-dependencies lint run-tests \
	create-volume launch-local stop-local interactive help

docker-clean: ## stop and kill all running containers
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill; docker container prune --force; docker system prune --force;
endif

build-dev: ## build docker image for local development
	docker build --platform $(PLATFORM) --target dev \
		-t $(IMAGE_DEV) .

build-prod: ## build docker image for production
	docker build --platform $(PLATFORM) --target prod \
		-t $(IMAGE_PROD) .

install-dependencies: ## install uv packages into the container volume
	docker run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(IMAGE_DEV) /bin/ash -c "uv lock && uv sync --group dev"

lint: ## run linters inside the container
	docker run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/ash -c "uv run black --check src tests && uv run isort --check-only src tests && uv run flake8 src tests"

run-tests: ## run pytest inside the container
	docker run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/ash -c "uv run pytest"

create-volume: ## create a volume for the database
	@echo "Creating container volume for database..."
	docker volume create --name $(COMPOSE_PROJECT_NAME)-db-data

launch-local: ## launch application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.yml up

stop-local: ## stop application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.yml down

interactive: ## open a shell inside the container
	docker run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/ash -c "source .venv/bin/activate && exec ash"

help: ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif

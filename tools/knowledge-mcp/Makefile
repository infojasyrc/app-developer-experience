ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := help

COMPOSE_PROJECT_NAME ?= knowledge-mcp
CONTAINER_APP_FOLDER = /app
HTTP_PORT ?= 8000
PLATFORM := $(PLATFORM)
IMAGE_DEV = $(COMPOSE_PROJECT_NAME)-dev
IMAGE_PROD = $(COMPOSE_PROJECT_NAME)
CONTAINER_NAME = $(COMPOSE_PROJECT_NAME)

PACKAGE_DIR := $(abspath .)
REPO_ROOT := $(abspath $(PACKAGE_DIR)/../..)

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := $(PACKAGE_DIR)
endif

DEV_VOLUME = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/.venv \
	-v $(COMPOSE_PROJECT_NAME)-packages:$(CONTAINER_APP_FOLDER)/.venv \
	-v $(REPO_ROOT):/repo:ro

DEV_ENV = \
	-e ADE_ROOT=/repo \
	-e INDEX_PATH=$(CONTAINER_APP_FOLDER)/dist/knowledge.json \
	-e PYTHONPATH=$(CONTAINER_APP_FOLDER)/src

.PHONY: docker-clean build-dev build-prod install-dependencies lint unit-tests \
	launch launch-local stop stop-local sync interactive help

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

install-dependencies: ## install packages into the container volume
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

unit-tests: ## run unit tests with coverage inside the container
	docker run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/ash -c "uv run pytest"

launch launch-local: ## start the MCP HTTP/SSE server
	docker run -d --name $(CONTAINER_NAME) \
		--platform $(PLATFORM) \
		-p $(HTTP_PORT):8000 \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/ash -c "uv run uvicorn main:app --host 0.0.0.0 --port 8000"

stop stop-local: ## stop the local MCP server
	-docker rm -f $(CONTAINER_NAME)

sync: ## rebuild the knowledge index (nx run knowledge-mcp:sync)
	docker run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/ash -c "mkdir -p dist && uv run python -m knowledge.sync"

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

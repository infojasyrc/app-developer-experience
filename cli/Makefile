ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := help

COMPOSE_PROJECT_NAME ?= app-dev-xp
CONTAINER_APP_FOLDER = /app
PLATFORM := $(PLATFORM)
IMAGE_DEV = $(COMPOSE_PROJECT_NAME)-cli-dev
IMAGE_PROD = $(COMPOSE_PROJECT_NAME)-cli

PACKAGE_DIR := $(abspath .)

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := $(PACKAGE_DIR)
endif

DEV_VOLUME = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/.venv \
	-v $(COMPOSE_PROJECT_NAME)-cli-packages:$(CONTAINER_APP_FOLDER)/.venv

DEV_ENV = \
	-e PYTHONPATH=$(CONTAINER_APP_FOLDER):$(CONTAINER_APP_FOLDER)/src \
	-e GIT_PYTHON_REFRESH=$(GIT_PYTHON_REFRESH)

.PHONY: build-dev build-prod create-volumes install-dependencies run-unit-tests \
	cli basic-commit interactive-commit build-local-package docker-clean interactive help

create-volumes: ## create external container volumes if they do not exist
	@echo "Checking and creating external volumes..."
	@docker volume inspect $(COMPOSE_PROJECT_NAME)-cli-packages >/dev/null 2>&1 || \
		(echo "Creating volume: $(COMPOSE_PROJECT_NAME)-cli-packages" && docker volume create $(COMPOSE_PROJECT_NAME)-cli-packages)

build-dev: ## build image for cli local development
	docker build --platform $(PLATFORM) --target dev \
		-t $(IMAGE_DEV) .

build-prod: ## build image for cli production
	docker build --platform $(PLATFORM) --target prod \
		-t $(IMAGE_PROD) .

docker-clean: ## stop and kill running containers and prune images
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill 2>/dev/null || true; docker container prune --force; docker system prune --force;
endif

install-dependencies: ## install all dependencies inside container using uv
	docker run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(IMAGE_DEV) /bin/sh -c "uv lock && uv sync --group dev"

cli: ## run cli entrypoint
	docker run -it --rm --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/sh -c "uv run python src/main.py"

run-unit-tests: ## run all unit tests inside container
	docker run --rm --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/sh -c "uv run pytest tests/"

basic-commit: ## basic commit workflow (requires m="...")
	ifeq ($(m),)
		$(error m is not set)
	endif
	docker run -it --rm --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/sh -c "uv run python src/main.py commit -m \"$(m)\""

interactive-commit: ## interactive commit workflow
	docker run -it --rm --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/sh -c "uv run python src/main.py commit"

build-local-package: ## build standalone binary package inside container
	docker run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/sh -c "uv run pyinstaller --onefile --copy-metadata readchar --copy-metadata inquirer --name=appdevexp src/main.py"

interactive: ## get a shell in the container with venv activated
	docker run -it --rm --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV) /bin/sh -c ". .venv/bin/activate 2>/dev/null || true; exec /bin/sh"

help: ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif
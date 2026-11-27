ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := help

COMPOSE_PROJECT_NAME ?= app-dev-xp
CONTAINER_APP_FOLDER = /app
PLATFORM := $(PLATFORM)
IMAGE_DEV = $(COMPOSE_PROJECT_NAME)-cli-dev
IMAGE_PROD = $(COMPOSE_PROJECT_NAME)-cli

PACKAGE_DIR := $(abspath .)
# ade-core is a path dependency (pyproject: ../tools/ade-core): mounted at /tools/ade-core
# for development and passed as the named build context `ade-core` for images.
ADE_CORE_DIR := $(abspath $(PACKAGE_DIR)/../tools/ade-core)
PYINSTALLER_FLAGS = --onefile --copy-metadata readchar --copy-metadata inquirer --copy-metadata ade-core \
	--collect-data ade_core --collect-data jsonschema_specifications --name=appdevexp

# scaffold inputs: make scaffold TARGET_DIR=/abs/path/to/repo ARGS="new service --template nestjs-rest --name orders-api"
TARGET_DIR ?= $(CURDIR)
ARGS ?= --help
# template bundles and the artifacts index are cached on the host so they survive container runs
CACHE_DIR ?= $(HOME)/.cache/appdevexp
TTY_FLAG := $(shell [ -t 0 ] && echo "-it" || echo "-i")

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := $(PACKAGE_DIR)
endif

DEV_VOLUME = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/.venv \
	-v $(COMPOSE_PROJECT_NAME)-cli-packages:$(CONTAINER_APP_FOLDER)/.venv \
	-v $(ADE_CORE_DIR):/tools/ade-core

DEV_ENV = \
	-e PYTHONPATH=$(CONTAINER_APP_FOLDER):$(CONTAINER_APP_FOLDER)/src \
	-e GIT_PYTHON_REFRESH=$(GIT_PYTHON_REFRESH)

.PHONY: build-dev build-prod create-volumes install-dependencies run-unit-tests \
	cli basic-commit interactive-commit build-local-package scaffold list-artifacts docker-clean interactive help

create-volumes: ## create external container volumes if they do not exist
	@echo "Checking and creating external volumes..."
	@docker volume inspect $(COMPOSE_PROJECT_NAME)-cli-packages >/dev/null 2>&1 || \
		(echo "Creating volume: $(COMPOSE_PROJECT_NAME)-cli-packages" && docker volume create $(COMPOSE_PROJECT_NAME)-cli-packages)

build-dev: ## build image for cli local development
	docker build --platform $(PLATFORM) --target dev \
		--build-context ade-core=$(ADE_CORE_DIR) \
		-t $(IMAGE_DEV) .

build-prod: ## build image for cli production (contains the appdevexp binary)
	docker build --platform $(PLATFORM) --target prod \
		--build-context ade-core=$(ADE_CORE_DIR) \
		-t $(IMAGE_PROD) .

scaffold: ## run appdevexp (prod image) against TARGET_DIR: make scaffold TARGET_DIR=/abs/repo ARGS="new service ..."
	@mkdir -p "$(CACHE_DIR)"
	docker run $(TTY_FLAG) --rm --platform $(PLATFORM) \
		--user "$$(id -u):$$(id -g)" \
		-e HOME=/tmp -e XDG_CACHE_HOME=/cache \
		-e APPDEVEXP_INDEX_URL -e GITHUB_TOKEN \
		-v "$(CACHE_DIR)":/cache/appdevexp \
		-v "$(TARGET_DIR)":/work -w /work \
		$(IMAGE_PROD) $(ARGS)

list-artifacts: ## list released ADE templates and versions (prod image)
	@$(MAKE) --no-print-directory scaffold ARGS="list"

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
		$(IMAGE_DEV) /bin/sh -c "uv run pyinstaller $(PYINSTALLER_FLAGS) src/main.py"

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
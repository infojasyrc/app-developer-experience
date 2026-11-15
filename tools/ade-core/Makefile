ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

CONTAINER_RUNTIME ?= docker
ifeq ($(filter $(CONTAINER_RUNTIME),docker podman container),)
$(error CONTAINER_RUNTIME must be docker, podman, or container)
endif

.DEFAULT_GOAL := help

PROJECT_NAME := $(PROJECT_NAME)
COMPOSE_PROJECT_NAME := $(COMPOSE_PROJECT_NAME)
CONTAINER_APP_FOLDER = /app
PLATFORM := $(PLATFORM)
IMAGE_DEV = $(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-dev
IMAGE_PROD = $(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)

PACKAGE_DIR := $(abspath .)
REPO_ROOT := $(abspath $(PACKAGE_DIR)/../..)
DIR := $(PACKAGE_DIR)

# render inputs: make render TEMPLATE=nestjs-rest-tpl NAME=orders-api FEATURES="database=none" OUT_DIR=/tmp/out
TEMPLATE ?=
NAME ?=
FEATURES ?=
OUT_DIR ?=
# combinations input: changed package keys from get-changed-packages (empty = all templates)
PACKAGES ?=

DEV_VOLUME = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/.venv \
	-v $(COMPOSE_PROJECT_NAME)-packages:$(CONTAINER_APP_FOLDER)/.venv \
	-v $(REPO_ROOT):/repo:ro

DEV_ENV = \
	-e ADE_ROOT=/repo \
	-e PYTHONPATH=$(CONTAINER_APP_FOLDER)/src

.PHONY: docker-clean build-dev build-prod install-dependencies lint unit-tests \
	format validate-manifests combinations render interactive help

docker-clean: ## stop and kill all running containers
	$(CONTAINER_RUNTIME) ps -qa | xargs $(CONTAINER_RUNTIME) kill; $(CONTAINER_RUNTIME) container prune --force; $(CONTAINER_RUNTIME) system prune --force;

build-dev: ## build container image for local development
	$(CONTAINER_RUNTIME) build --platform $(PLATFORM) --target dev \
		-t $(IMAGE_DEV):latest .

build-prod: ## build container image for production
	$(CONTAINER_RUNTIME) build --platform $(PLATFORM) --target prod \
		-t $(IMAGE_PROD):latest .

install-dependencies: ## install packages into the container volume
	$(CONTAINER_RUNTIME) run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(IMAGE_DEV):latest /bin/ash -c "uv lock && uv sync --group dev"

lint: ## run linters inside the container
	$(CONTAINER_RUNTIME) run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV):latest /bin/ash -c "uv run black --check src tests && uv run isort --check-only src tests && uv run flake8 src tests"

format: ## format code with black and isort inside the container
	$(CONTAINER_RUNTIME) run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(IMAGE_DEV):latest /bin/ash -c "uv run black src tests && uv run isort src tests"

unit-tests: ## run unit tests with coverage inside the container
	$(CONTAINER_RUNTIME) run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV):latest /bin/ash -c "uv run pytest"

validate-manifests: ## render every feature combination of every backend template manifest
	$(CONTAINER_RUNTIME) run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV):latest /bin/ash -c "uv run python -m ade_core validate --repo /repo"

combinations: ## print the GitHub Actions matrix of feature combinations (PACKAGES="tpl-nestjs-rest ...")
	@$(CONTAINER_RUNTIME) run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV):latest /bin/ash -c "/app/.venv/bin/python -m ade_core combinations --repo /repo --packages '$(PACKAGES)'"

render: ## render a template: TEMPLATE=<dir under backend/> NAME=<name> FEATURES="k=v ..." OUT_DIR=<abs path>
	@[ -n "$(TEMPLATE)" ] && [ -n "$(NAME)" ] && [ -n "$(OUT_DIR)" ] || \
		{ echo "TEMPLATE, NAME and OUT_DIR are required"; exit 1; }
	mkdir -p "$(OUT_DIR)"
	$(CONTAINER_RUNTIME) run --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		--user "$$(id -u):$$(id -g)" \
		-e HOME=/tmp \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		-v "$(OUT_DIR)":/out \
		$(IMAGE_DEV):latest /bin/ash -c "/app/.venv/bin/python -m ade_core render /repo/backend/$(TEMPLATE) --out /out --name $(NAME) $(foreach f,$(FEATURES),--feature $(f))"

interactive: ## open a shell inside the container
	$(CONTAINER_RUNTIME) run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(DEV_ENV) \
		$(IMAGE_DEV):latest /bin/ash -c "source .venv/bin/activate && exec ash"

help: ## show all make commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

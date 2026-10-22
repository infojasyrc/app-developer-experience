# use an environment file to use standard configuration
ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

CONTAINER_RUNTIME ?= docker
ifeq ($(filter $(CONTAINER_RUNTIME),docker podman container),)
$(error CONTAINER_RUNTIME must be docker, podman, or container)
endif

.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

COMPOSE_PROJECT_NAME = nestjs-gql-tpl
CONTAINER_APP_FOLDER = /app

# Available platforms: linux/amd64 | linux/arm64 | linux/x86_64
PLATFORM := $(PLATFORM)

USER_HOME := $(shell echo $$HOME)
USER_NPMRC = $(USER_HOME)/.npmrc

DIR := "$$(pwd)"

# include codebase and dependencies to run the container in development mode
DEV_VOLUME = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/node_modules \
	-v $(COMPOSE_PROJECT_NAME)-packages:$(CONTAINER_APP_FOLDER)/node_modules

.PHONY: docker-clean
docker-clean: ## stop and kill all running containers
	@ids=$$($(CONTAINER_RUNTIME) ps -qa); \
	if [ -n "$$ids" ]; then printf '%s\n' $$ids | xargs $(CONTAINER_RUNTIME) kill; fi; \
	$(CONTAINER_RUNTIME) container prune --force; \
	$(CONTAINER_RUNTIME) system prune --force

.PHONY: build-dev
build-dev: ## build docker image for local development
	$(CONTAINER_RUNTIME) build --platform $(PLATFORM) --target development \
		-t $(COMPOSE_PROJECT_NAME) .

.PHONY: build-dev-with-npmrc
build-dev-with-npmrc: ## build docker image for local development with .npmrc
	$(CONTAINER_RUNTIME) build --platform $(PLATFORM) --target development \
		--build-arg NPMRC="$$(cat $(USER_NPMRC))" \
		-t $(COMPOSE_PROJECT_NAME) .

.PHONY: build-prod
build-prod: ## build production docker image
	$(CONTAINER_RUNTIME) build --platform $(PLATFORM) --target release \
		-t $(COMPOSE_PROJECT_NAME) .

.PHONY: build-stable
build-stable: ## build docker image stable version
	$(CONTAINER_RUNTIME) build -t $(COMPOSE_PROJECT_NAME):1.0.0 .

.PHONY: create-volumes
create-volumes: ## create external container volumes if they do not exist
	@echo "Checking and creating external volumes..."
	@$(CONTAINER_RUNTIME) volume inspect $(COMPOSE_PROJECT_NAME)-packages >/dev/null 2>&1 || \
		(echo "Creating volume: $(COMPOSE_PROJECT_NAME)-packages" && $(CONTAINER_RUNTIME) volume create $(COMPOSE_PROJECT_NAME)-packages)
	@$(CONTAINER_RUNTIME) volume inspect $(COMPOSE_PROJECT_NAME)-db-data >/dev/null 2>&1 || \
		(echo "Creating volume: $(COMPOSE_PROJECT_NAME)-db-data" && $(CONTAINER_RUNTIME) volume create $(COMPOSE_PROJECT_NAME)-db-data)
	@$(CONTAINER_RUNTIME) volume inspect $(COMPOSE_PROJECT_NAME)-unleash-db-data >/dev/null 2>&1 || \
		(echo "Creating volume: $(COMPOSE_PROJECT_NAME)-unleash-db-data" && $(CONTAINER_RUNTIME) volume create $(COMPOSE_PROJECT_NAME)-unleash-db-data)

.PHONY: install-dependencies
install-dependencies: ## install dependencies for dev image
	$(CONTAINER_RUNTIME) run -t --rm --workdir="$(CONTAINER_APP_FOLDER)" $(DEV_VOLUME) \
		--platform $(PLATFORM) \
		$(COMPOSE_PROJECT_NAME) /bin/ash -ci "npm i"

.PHONY: lint
lint: ## run lint checks
	$(CONTAINER_RUNTIME) run -t --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME) /bin/ash -ci "npm run lint"

.PHONY: unit-tests
unit-tests: ## run unit tests with coverage
	$(CONTAINER_RUNTIME) run -t --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME) /bin/ash -ci "npm run test:unit:coverage"

.PHONY: interactive
interactive: ## get a bash shell in the container
	$(CONTAINER_RUNTIME) run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		-p "8080:3000" \
		$(COMPOSE_PROJECT_NAME) /bin/ash

.PHONY: launch-unleash
launch-unleash: ## launch feature toggles with unleash
	$(CONTAINER_RUNTIME) compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.unleash.yml up

.PHONY: stop-unleash
stop-unleash: ## stop feature toogle service
	$(CONTAINER_RUNTIME) compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.unleash.yml down

.PHONY: launch-local
launch-local: ## launch application for local development
	$(CONTAINER_RUNTIME) compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.unleash.yml -f docker-compose/docker-compose.local.yml up

.PHONY: stop-local
stop-local: ## stop application for local development
	$(CONTAINER_RUNTIME) compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.unleash.yml -f docker-compose/docker-compose.local.yml down

.PHONY: launch-db
launch-db: ## launch database as a service
	$(CONTAINER_RUNTIME) compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml up

.PHONY: stop-db
stop-db: ## stop database service
	$(CONTAINER_RUNTIME) compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml down

.PHONY: help
help:  ## show all make commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

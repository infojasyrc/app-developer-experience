# use an environment file to use standard configuration
ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

COMPOSE_PROJECT_NAME = ms-nestjs-template
CONTAINER_APP_FOLDER = /app

# available platforms linux/amd64 | linux/arm64/v8 | linux/x86_64
PLATFORM = linux/arm64/v8

ifeq ($(OS),Windows_NT)
	USER_HOME := $(shell echo %USERPROFILE%)
else
	USER_HOME := $(shell echo $$HOME)
endif
USER_NPMRC = $(USER_HOME)/.npmrc

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

# include codebase and dependencies to run the container in development mode
DEV_VOLUME = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(USER_NPMRC):/root/.npmrc:ro \
	-v $(CONTAINER_APP_FOLDER)/node_modules \
	-v $(COMPOSE_PROJECT_NAME)-packages:$(CONTAINER_APP_FOLDER)/node_modules

.PHONY: docker-clean
docker-clean: ## stop and kill all running containers
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill; docker container prune --force; docker system prune --force;
endif

.PHONY: build-dev
build-dev: ## build docker image for local development
	docker build --platform $(PLATFORM) --target base \
		--build-arg NPMRC="$$(cat $(USER_NPMRC))" \
		-t $(COMPOSE_PROJECT_NAME) .

.PHONY: build-stable
build-stable: ## build docker image stable version
	docker build -t $(COMPOSE_PROJECT_NAME):1.0.0 .

.PHONY: install-dependencies
install-dependencies: ## install dependencies for dev image
	docker run -it --workdir="$(CONTAINER_APP_FOLDER)" $(DEV_VOLUME) \
		--platform $(PLATFORM) \
		$(COMPOSE_PROJECT_NAME) /bin/ash -ci "npm i"

.PHONY: interactive
interactive: ## get a bash shell in the container
	docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		-p "8080:3000" \
		$(COMPOSE_PROJECT_NAME) /bin/ash

.PHONY: launch-unleash
launch-unleash: ## launch feature toggles with unleash
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.unleash.yml up

.PHONY: stop-unleash
stop-unleash: ## stop feature toogle service
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.unleash.yml down

.PHONY: launch-local
launch-local: ## launch application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.unleash.yml -f docker-compose/docker-compose.local.yml up

.PHONY: stop-local
stop-local: ## stop application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.unleash.yml -f docker-compose/docker-compose.local.yml down

.PHONY: launch-db
launch-db: ## launch database as a service
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml up

.PHONY: stop-db
stop-db: ## stop database service
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml down

.PHONY: help
help:  ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif
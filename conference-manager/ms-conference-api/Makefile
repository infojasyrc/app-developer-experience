# .env.public for common environment variables
ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

LOCAL_APP_FOLDER  = /usr/src/app
CONTAINER_APP_FOLDER = /app

DB_URL     = mongodb://$(DB_ROOT_USERNAME):$(DB_ROOT_PASSWORD)@localhost:$(DB_PORT)/?authSource=admin
DEFAULT_DB = mongodb
TOKEN_SCRIPT_FILE = scripts/firebase-auth-test

COMPOSE_PROJECT_NAME = ms-conference

# Available platforms: linux/amd64 | linux/arm64/v8 | linux/x86_64 | linux/arm/v7
PLATFORM = linux/arm64/v8

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

# include dependencies and codebase to a container excluding local dependencies that could conflict with one from volumes
DEV_VOLUME_API = \
	-v $(DIR):$(LOCAL_APP_FOLDER) \
	-v $(LOCAL_APP_FOLDER)/node_modules \
	-v $(COMPOSE_PROJECT_NAME)-api-packages:$(LOCAL_APP_FOLDER)/node_modules

.PHONY: docker-clean
docker-clean: ## stop+kill all running containers. prune stopped containers. remove all untagged images
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach-object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill; docker container prune --force; docker system prune --force;
endif

.PHONY: build-dev
build-dev: ## build dev container image for backend
	docker build --platform $(PLATFORM) --target development \
		-t $(COMPOSE_PROJECT_NAME)-api-dev .

.PHONY: build-api
build-api: ## build prod container image for backend
	docker build --platform $(PLATFORM) \
		-t $(COMPOSE_PROJECT_NAME)-api .

.PHONY: get-token
get-token: ## Retrieve an access token for admin or user roles [ROLE=admin|ROLE=user]
	node $(TOKEN_SCRIPT_FILE) $(ROLE)

.PHONY: interactive
interactive: ## run the api standalone only for healthcheck and no db connection
	docker run -it --rm --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		-p "5002:5002" \
		$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash

.PHONY: install-dependencies
install-dependencies: ## install node packages for api dev server into volume
	docker run -t --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn install"

.PHONY: audit-fix-dependencies
audit-fix-dependencies: ## verify and fix critical/high node package vulnerabilities for api dev server into volume
	docker run -t --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -c "yarn run security:audit && yarn run security:fix"

.PHONY: lint
lint: ## run lint for api
	docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn run lint"

.PHONY: unit-tests
unit-tests: unit-tests-v1 unit-tests-v2 ## run all unit tests

.PHONY: unit-tests-v1
unit-tests-v1: ## run all unit tests using ava
	docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn run test:unit-tests:v1"

.PHONY: unit-tests-v2
unit-tests-v2: ## run all unit tests using jest
	docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn run test:unit-tests:v2"

.PHONY: launch-db
launch-db: docker-clean ## launch db container on local machine
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml up

.PHONY: stop-db
stop-db: ## locally stop all containers for local development
	docker compose --env-file=$(ENV_FILE) -f docker-compose/docker-compose.db.yml down

.PHONY: launch-local-dev
launch-local-dev: ## launch application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.dev.api.yml up

.PHONY: stop-local-dev
stop-local-dev: ## stop application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.dev.api.yml down

.PHONY: launch-local-prod
launch-local-prod: docker-clean ## launch the multi-container on local machine
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.api.yml up

.PHONY: stop-local-prod
stop-local-prod: ## locally stop all containers for local production
	docker compose --env-file=$(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.api.yml down

.PHONY: help
help:  ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif

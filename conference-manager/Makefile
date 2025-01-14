# .env.public for common environment variables
ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

LOCAL_APP_FOLDER  = /usr/src/app

DB_URL     = mongodb://mongoDev:Passw0rd@localhost:27017/?authSource=admin
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
DEV_VOLUMES = \
	-v $(DIR):$(LOCAL_APP_FOLDER) \
	-v $(LOCAL_APP_FOLDER)/node_modules \
	-v $(COMPOSE_PROJECT_NAME)-backend-packages:$(LOCAL_APP_FOLDER)/node_modules

.PHONY: docker-clean
docker-clean: ## stop+kill all running containers. prune stopped containers. remove all untagged images
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach-object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill; docker container prune --force; docker system prune --force;
endif

.PHONY: build-dev-backend
build-dev-backend: ## build dev container image for backend
	cd ./ms-conference-api; docker build -t $(COMPOSE_PROJECT_NAME)-api \
		--target development \
		--platform $(PLATFORM) .

.PHONY: backend-install-packages
backend-install-packages: ## install node packages for backend dev server into volume
	cd ./ms-conference-api; docker run -t --workdir="$(LOCAL_APP_FOLDER)" $(DEV_VOLUMES) \
		--platform $(PLATFORM) \
		$(COMPOSE_PROJECT_NAME)-api /bin/ash -ci "yarn install"

.PHONY: build-prod-backend
build-prod-backend: ## build prod container image for backend
	cd ./ms-conference-api; docker build -t $(COMPOSE_PROJECT_NAME)-backend-prod \
		--platform $(PLATFORM) .

.PHONY: get-token
get-token: ## Retrieve an access token for admin or user roles [ROLE=admin|ROLE=user]
	cd ./ms-conference-api; node $(TOKEN_SCRIPT_FILE) $(ROLE)

.PHONY: interactive
interactive: ## run the api standalone only for healthcheck and no db connection
	cd ./ms-conference-api; docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUMES) \
		-p "5002:5002" \
		$(COMPOSE_PROJECT_NAME)-api:latest /bin/ash

.PHONY: lint
lint: ## run lint for all the project
	cd ./ms-conference-api; docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUMES) \
		$(COMPOSE_PROJECT_NAME)-api:latest /bin/ash -ci "yarn run lint"

.PHONY: unit-tests
unit-tests: unit-tests-v1 unit-tests-v2 ## run all unit tests

.PHONY: unit-tests-v1
unit-tests-v1: ## run all unit tests using ava
	cd ./ms-conference-api; docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUMES) \
		$(COMPOSE_PROJECT_NAME)-api:latest /bin/ash -ci "yarn run test:unit-tests:v1"

.PHONY: unit-tests-v2
unit-tests-v2: ## run all unit tests using jest
	cd ./ms-conference-api; docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUMES) \
		$(COMPOSE_PROJECT_NAME)-api:latest /bin/ash -ci "yarn run test:unit-tests:v2"

.PHONY: launch-db
launch-db: docker-clean ## launch db container on local machine
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml up

.PHONY: launch-local
launch-local: docker-clean ## launch the multi-container on local machine
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.yml up

.PHONY: stop-db
stop-db: ## locally stop all containers for local development
	docker compose --env-file=$(ENV_FILE) -f docker-compose/docker-compose.db.yml down

.PHONY: stop-local
stop-local: ## locally stop all containers for local development
	docker compose --env-file=$(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.yml down

.PHONY: help
help:  ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif

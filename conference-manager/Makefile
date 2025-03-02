# .env.public for common environment variables
ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

LOCAL_APP_FOLDER  = /usr/src/app
CONTAINER_APP_FOLDER = /app

DB_URL     = mongodb://mongoDev:Passw0rd@localhost:27017/?authSource=admin
DEFAULT_DB = mongodb
TOKEN_SCRIPT_FILE = scripts/firebase-auth-test

COMPOSE_PROJECT_NAME = ms-conference
MS_API_FOLDER = ms-conference-api
MS_ADMIN_FOLDER = ms-conference-admin

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

DEV_VOLUME_ADMIN = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/.venv \
	-v $(COMPOSE_PROJECT_NAME)-admin-packages:$(CONTAINER_APP_FOLDER)/.venv

.PHONY: docker-clean
docker-clean: ## stop+kill all running containers. prune stopped containers. remove all untagged images
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach-object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill; docker container prune --force; docker system prune --force;
endif

.PHONY: build-dev-api
build-dev-api: ## build dev container image for backend
	cd ./$(MS_API_FOLDER); docker build --platform $(PLATFORM) --target development \
		-t $(COMPOSE_PROJECT_NAME)-api .

.PHONY: build-dev-admin
build-dev-admin: ## build container image for admin local development
	cd ./$(MS_ADMIN_FOLDER); docker build --platform $(PLATFORM) --target build \
		-t $(COMPOSE_PROJECT_NAME)-admin-dev .

.PHONY: build-prod-api
build-prod-api: ## build prod container image for backend
	cd ./$(MS_API_FOLDER); docker build -t $(COMPOSE_PROJECT_NAME)-backend-prod \
		--platform $(PLATFORM) .

.PHONY: get-token
get-token: ## Retrieve an access token for admin or user roles [ROLE=admin|ROLE=user]
	cd ./$(MS_API_FOLDER); node $(TOKEN_SCRIPT_FILE) $(ROLE)

.PHONY: interactive-api
interactive-api: ## run the api standalone only for healthcheck and no db connection
	cd ./$(MS_API_FOLDER); docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		-p "5002:5002" \
		$(COMPOSE_PROJECT_NAME)-api /bin/ash

.PHONY: interactive-admin
interactive-admin: ## get a bash shell in the container
	cd ./$(MS_ADMIN_FOLDER); docker run -it --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_ADMIN) \
		$(COMPOSE_PROJECT_NAME)-admin-dev /bin/ash

.PHONY: install-dependencies-api
install-dependencies-api: ## install node packages for api dev server into volume
	cd ./$(MS_API_FOLDER); docker run -t --workdir="$(LOCAL_APP_FOLDER)" $(DEV_VOLUME_API) \
		--platform $(PLATFORM) \
		$(COMPOSE_PROJECT_NAME)-api /bin/ash -ci "yarn install"

.PHONY: install-dependencies-admin
install-dependencies-admin: ## install packages from pipfile
	cd ./$(MS_ADMIN_FOLDER); docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_ADMIN) \
		$(COMPOSE_PROJECT_NAME)-admin /bin/ash -ci "pipenv install --dev"

.PHONY: lint
lint: ## run lint for all the project
	cd ./$(MS_API_FOLDER); docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(COMPOSE_PROJECT_NAME)-api:latest /bin/ash -ci "yarn run lint"

.PHONY: unit-tests-api
unit-tests-api: unit-tests-v1 unit-tests-v2 ## run all unit tests

.PHONY: unit-tests-v1
unit-tests-v1: ## run all unit tests using ava
	cd ./$(MS_API_FOLDER); docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(COMPOSE_PROJECT_NAME)-api:latest /bin/ash -ci "yarn run test:unit-tests:v1"

.PHONY: unit-tests-v2
unit-tests-v2: ## run all unit tests using jest
	cd ./$(MS_API_FOLDER); docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(COMPOSE_PROJECT_NAME)-api:latest /bin/ash -ci "yarn run test:unit-tests:v2"

.PHONY: run-tests-admin
run-admin-tests: ## run integration tests against admin microservice
	cd ./$(MS_ADMIN_FOLDER); docker run -t --net=$(COMPOSE_PROJECT_NAME)-admin-network \
		--workdir="$(CONTAINER_APP_FOLDER)/src" \
		$(DEV_VOLUME_ADMIN) \
		--env JWT_SECRET_KEY=$(JWT_SECRET_KEY) \
		--env JWT_REFRESH_SECRET_KEY=$(JWT_REFRESH_SECRET_KEY) \
		--platform $(PLATFORM) \
		$(COMPOSE_PROJECT_NAME)-admin /bin/ash -ci "pipenv run python -m pytest tests/"

.PHONY: launch-db
launch-db: docker-clean ## launch db container on local machine
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml up

.PHONY: launch-api-local
launch-api-local: docker-clean ## launch the multi-container on local machine
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.api.yml up

.PHONY: stop-db
stop-db: ## locally stop all containers for local development
	docker compose --env-file=$(ENV_FILE) -f docker-compose/docker-compose.db.yml down

.PHONY: stop-api-local
stop-api-local: ## locally stop all containers for local development
	docker compose --env-file=$(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.api.yml down

.PHONY: launch-admin-local
launch-admin-local: ## launch application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.admin.yml up

.PHONY: stop-admin-local
stop-admin-local: ## stop application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.admin.yml down

.PHONY: launch-admin-dev
launch-admin-dev: ## launch application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.dev.admin.yml up

.PHONY: stop-admin-dev
stop-admin-dev: ## stop application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.dev.admin.yml down

.PHONY: help
help:  ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif

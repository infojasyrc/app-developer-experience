# .env.public for common environment variables
ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := cm-help # when you run make, it defaults to printing available commands

LOCAL_APP_FOLDER  = /usr/src/app
CONTAINER_APP_FOLDER = /app

DB_URL     = mongodb://$(DB_ROOT_USERNAME):$(DB_ROOT_PASSWORD)@localhost:$(DB_PORT)/?authSource=admin
DEFAULT_DB = mongodb
TOKEN_SCRIPT_FILE = scripts/firebase-auth-test

COMPOSE_PROJECT_NAME = ms-conference
MS_API_FOLDER = ms-conference-api
MS_ADMIN_FOLDER = ms-conference-admin
MS_WEBAPP_FOLDER = ms-conference-webapp

# Available platforms: linux/amd64 | linux/arm64/v8 | linux/x86_64 | linux/arm/v7
PLATFORM = linux/arm64/v8

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

DEV_VOLUME_WEBAPP = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/node_modules \
	-v $(COMPOSE_PROJECT_NAME)-webapp-packages:$(CONTAINER_APP_FOLDER)/node_modules

# include dependencies and codebase to a container excluding local dependencies that could conflict with one from volumes
DEV_VOLUME_API = \
	-v $(DIR):$(LOCAL_APP_FOLDER) \
	-v $(LOCAL_APP_FOLDER)/node_modules \
	-v $(COMPOSE_PROJECT_NAME)-api-packages:$(LOCAL_APP_FOLDER)/node_modules

DEV_VOLUME_ADMIN = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/.venv \
	-v $(COMPOSE_PROJECT_NAME)-admin-packages:$(CONTAINER_APP_FOLDER)/.venv

# Component Makefile paths
WEBAPP_MAKEFILE := $(MS_WEBAPP_FOLDER)/Makefile
API_MAKEFILE    := $(MS_API_FOLDER)/Makefile

.PHONY: cm-webapp-help cm-api-help
cm-webapp-help: ## 📚 Show Webapp component targets
	@$(MAKE) -C $(MS_WEBAPP_FOLDER) cm-webapp-help

cm-api-help: ## 📚 Show API component targets
	@$(MAKE) -C $(MS_API_FOLDER) help

.PHONY: cm-help
cm-help: ## ❓ Show Conference Manager root + component targets
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@echo "\nRoot Targets:" && \
	grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' && \
	echo "\nWebapp Targets:" && $(MAKE) -C $(MS_WEBAPP_FOLDER) cm-webapp-help && \
	echo "\nAPI Targets:" && $(MAKE) -C $(MS_API_FOLDER) help
endif

# ===== Webapp proxies (namespaced) =====
.PHONY: cm-webapp-build-dev cm-webapp-build-prod cm-webapp-install-dependencies cm-webapp-lint cm-webapp-unit-tests \
        cm-webapp-run-storybook cm-webapp-interactive cm-webapp-npm-audit cm-webapp-docker-clean cm-webapp-commit

cm-webapp-build-dev: ## 🛠️ Build Webapp dev image (proxy)
	@$(MAKE) -C $(MS_WEBAPP_FOLDER) cm-webapp-build-dev

cm-webapp-build-prod: ## 🛠️ Build Webapp prod image (proxy)
	@$(MAKE) -C $(MS_WEBAPP_FOLDER) cm-webapp-build-prod

cm-webapp-install-dependencies: ## 📦 Install Webapp dependencies (proxy)
	@$(MAKE) -C $(MS_WEBAPP_FOLDER) cm-webapp-install-dependencies

cm-webapp-lint: ## 🔍 Lint Webapp (proxy)
	@$(MAKE) -C $(MS_WEBAPP_FOLDER) cm-webapp-lint

cm-webapp-unit-tests: ## 🧪 Run Webapp unit tests (proxy)
	@$(MAKE) -C $(MS_WEBAPP_FOLDER) cm-webapp-unit-tests

cm-webapp-run-storybook: ## 📚 Run Storybook (proxy)
	@$(MAKE) -C $(MS_WEBAPP_FOLDER) cm-webapp-run-storybook

cm-webapp-interactive: ## 🧑‍💻 Interactive shell in Webapp container (proxy)
	@$(MAKE) -C $(MS_WEBAPP_FOLDER) cm-webapp-interactive

cm-webapp-npm-audit: ## 🛡️ Audit Webapp dependencies (proxy)
	@$(MAKE) -C $(MS_WEBAPP_FOLDER) cm-webapp-npm-audit

cm-webapp-docker-clean: ## 🧹 Clean Docker for Webapp (proxy)
	@$(MAKE) -C $(MS_WEBAPP_FOLDER) cm-webapp-docker-clean

cm-webapp-commit: ## 📝 Conventional commit in Webapp (proxy)
	@$(MAKE) -C $(MS_WEBAPP_FOLDER) cm-webapp-commit

# ===== API proxies (namespaced) =====
.PHONY: cm-api-build-dev cm-api-build-prod cm-api-install-dependencies cm-api-lint cm-api-unit-tests cm-api-unit-tests-v1 cm-api-unit-tests-v2 \
        cm-api-get-token cm-api-interactive cm-api-docker-clean cm-api-launch-local-dev cm-api-stop-local-dev cm-api-launch-local-prod cm-api-stop-local-prod \
        cm-api-launch-db cm-api-stop-db cm-api-launch-unleash cm-api-stop-unleash

cm-api-build-dev: ## 🛠️ Build API dev image (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) build-dev

cm-api-build-prod: ## 🛠️ Build API prod image (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) build-prod

cm-api-install-dependencies: ## 📦 Install API dependencies (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) install-dependencies

cm-api-lint: ## 🔍 Lint API (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) lint

cm-api-unit-tests: ## 🧪 Run all API unit tests (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) unit-tests

cm-api-unit-tests-v1: ## 🧪 Run API AVA tests (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) unit-tests-v1

cm-api-unit-tests-v2: ## 🧪 Run API Jest tests (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) unit-tests-v2

cm-api-get-token: ## 🔐 Get Firebase token (proxy) Usage: make cm-api-get-token ROLE=admin|user
	@$(MAKE) -C $(MS_API_FOLDER) get-token ROLE=$(ROLE)

cm-api-interactive: ## 🧑‍💻 Interactive API container (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) interactive

cm-api-docker-clean: ## 🧹 Clean Docker for API (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) docker-clean

cm-api-launch-local-dev: ## 🚀 Launch API dev stack (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) launch-local-dev

cm-api-stop-local-dev: ## 🛑 Stop API dev stack (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) stop-local-dev

cm-api-launch-local-prod: ## 🚀 Launch API prod-like stack (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) launch-local-prod

cm-api-stop-local-prod: ## 🛑 Stop API prod-like stack (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) stop-local-prod

cm-api-launch-db: ## 🗄️ Launch DB (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) launch-db

cm-api-stop-db: ## 🛑 Stop DB (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) stop-db

cm-api-launch-unleash: ## 🚀 Launch Unleash (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) launch-unleash

cm-api-stop-unleash: ## 🛑 Stop Unleash (proxy)
	@$(MAKE) -C $(MS_API_FOLDER) stop-unleash

.PHONY: docker-clean
docker-clean: ## stop+kill all running containers. prune stopped containers. remove all untagged images
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach-object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill; docker container prune --force; docker system prune --force;
endif

.PHONY: build-dev-webapp
build-dev-webapp: ## build dev container image for webapp
	cd ./$(MS_WEBAPP_FOLDER); docker build --platform $(PLATFORM) --target development \
		-t $(COMPOSE_PROJECT_NAME)-webapp-dev .

.PHONY: build-dev-api
build-dev-api: ## build dev container image for backend
	cd ./$(MS_API_FOLDER); docker build --platform $(PLATFORM) --target development \
		-t $(COMPOSE_PROJECT_NAME)-api-dev .

.PHONY: build-dev-admin
build-dev-admin: ## build container image for admin local development
	cd ./$(MS_ADMIN_FOLDER); docker build --platform $(PLATFORM) --target build \
		-t $(COMPOSE_PROJECT_NAME)-admin-dev .

.PHONY: build-webapp
build-webapp: ## build container image for webapp
	cd ./$(MS_WEBAPP_FOLDER); docker build \
		--build-arg REACT_APP_BASE_PATH=${REACT_APP_BASE_PATH} \
		--build-arg REACT_APP_VERSION=${REACT_APP_VERSION} \
		--build-arg REACT_APP_API_KEY=${REACT_APP_API_KEY} \
		--build-arg REACT_APP_AUTH_DOMAIN=${REACT_APP_AUTH_DOMAIN} \
		--build-arg REACT_APP_DATABASE_URL=${REACT_APP_DATABASE_URL} \
		--build-arg REACT_APP_PROJECT_ID=${REACT_APP_PROJECT_ID} \
		--build-arg REACT_APP_STORAGE_BUCKET=${REACT_APP_STORAGE_BUCKET} \
		--build-arg REACT_APP_MESSAGING_SENDER_ID=${REACT_APP_MESSAGING_SENDER_ID} \
		--build-arg REACT_APP_FIREBASE_APP_ID=${REACT_APP_FIREBASE_APP_ID} \
		--build-arg REACT_APP_MEASUREMENT_ID=${REACT_APP_MEASUREMENT_ID} \
		--platform $(PLATFORM) . \
		-t $(COMPOSE_PROJECT_NAME)-webapp

.PHONY: build-admin
build-admin: ## build container image for admin local development
	cd ./$(MS_ADMIN_FOLDER); docker build --platform $(PLATFORM) \
		-t $(COMPOSE_PROJECT_NAME)-admin .

.PHONY: build-api
build-api: ## build prod container image for backend
	cd ./$(MS_API_FOLDER); docker build --platform $(PLATFORM) \
		-t $(COMPOSE_PROJECT_NAME)-api .

.PHONY: get-token
get-token: ## Retrieve an access token for admin or user roles [ROLE=admin|ROLE=user]
	cd ./$(MS_API_FOLDER); node $(TOKEN_SCRIPT_FILE) $(ROLE)

.PHONY: interactive-api
interactive-api: ## run the api standalone only for healthcheck and no db connection
	cd ./$(MS_API_FOLDER); docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		-p "5002:5002" \
		$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash

.PHONY: interactive-admin
interactive-admin: ## get a bash shell in the container
	cd ./$(MS_ADMIN_FOLDER); docker run -it --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_ADMIN) \
		--env PATH="/app/.venv/bin:$PATH" \
		--env PIPENV_PIPFILE=/app/Pipfile \
		--env DB_ROOT_USERNAME=$(DB_ROOT_USERNAME) \
		--env DB_ROOT_PASSWORD=$(DB_ROOT_PASSWORD) \
		--env DB_HOST=localhost \
		--env DB_PORT=$(DB_PORT) \
		--env DEFAULT_DB=$(DEFAULT_DB) \
		$(COMPOSE_PROJECT_NAME)-admin-dev /bin/ash

.PHONY: interactive-webapp
interactive-webapp: ## get a bash shell in the container
	cd ./$(MS_WEBAPP_FOLDER); docker run -it --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_WEBAPP) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash

.PHONY: run-storybook
run-storybook: ## run storybook
	cd ./$(MS_WEBAPP_FOLDER); docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_WEBAPP) \
		-p "6006:6006" \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run storybook -- --no-open --host 0.0.0.0"

.PHONY: install-dependencies-api
install-dependencies-api: ## install node packages for api dev server into volume
	cd ./$(MS_API_FOLDER); docker run -t --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn install"

.PHONY: install-dependencies-admin
install-dependencies-admin: ## install packages from pipfile
	cd ./$(MS_ADMIN_FOLDER); docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_ADMIN) \
		$(COMPOSE_PROJECT_NAME)-admin-dev /bin/ash -ci "pipenv install --dev"

.PHONY: install-dependencies-webapp
install-dependencies-webapp: ## install node packages for webapp dev server into volume
	cd ./$(MS_WEBAPP_FOLDER); docker run -t --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_WEBAPP) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm install"

.PHONY: lint-api
lint-api: ## run lint for api
	cd ./$(MS_API_FOLDER); docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn run lint"

.PHONY: lint-webapp
lint-webapp: ## run linter for webapp
	cd ./$(MS_WEBAPP_FOLDER); docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_WEBAPP) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run lint"

.PHONY: unit-tests-webapp
unit-tests-webapp: ## run all unit tests for webapp
	cd ./$(MS_WEBAPP_FOLDER); docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_WEBAPP) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run test:watch"

.PHONY: unit-tests-api
unit-tests-api: unit-tests-v1 unit-tests-v2 ## run all unit tests

.PHONY: unit-tests-v1
unit-tests-v1: ## run all unit tests using ava
	cd ./$(MS_API_FOLDER); docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn run test:unit-tests:v1"

.PHONY: unit-tests-v2
unit-tests-v2: ## run all unit tests using jest
	cd ./$(MS_API_FOLDER); docker run -it --workdir="$(LOCAL_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME_API) \
		$(COMPOSE_PROJECT_NAME)-api-dev /bin/ash -ci "yarn run test:unit-tests:v2"

# .PHONY: run-tests-admin
# run-admin-tests: ## run integration tests against admin microservice
# 	cd ./$(MS_ADMIN_FOLDER); docker run -t --net=$(COMPOSE_PROJECT_NAME)-admin-network \
# 		--workdir="$(CONTAINER_APP_FOLDER)/src" \
# 		$(DEV_VOLUME_ADMIN) \
# 		--platform $(PLATFORM) \
# 		$(COMPOSE_PROJECT_NAME)-admin-dev /bin/ash -ci "pipenv run python -m pytest tests/"

.PHONY: launch-db
launch-db: docker-clean ## launch db container on local machine
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml up

.PHONY: stop-db
stop-db: ## locally stop all containers for local development
	docker compose --env-file=$(ENV_FILE) -f docker-compose/docker-compose.db.yml down

.PHONY: launch-api-local
launch-api-local: docker-clean ## launch the multi-container on local machine
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.api.yml up

.PHONY: stop-api-local
stop-api-local: ## locally stop all containers for local development
	docker compose --env-file=$(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.api.yml down

.PHONY: launch-admin-local
launch-admin-local: ## launch application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.admin.yml up

.PHONY: stop-admin-local
stop-admin-local: ## stop application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.admin.yml down

.PHONY: launch-api-dev
launch-api-dev: ## launch application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.dev.api.yml up

.PHONY: stop-api-dev
stop-api-dev: ## stop application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.dev.api.yml down

.PHONY: launch-admin-dev
launch-admin-dev: ## launch application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.dev.admin.yml up

.PHONY: stop-admin-dev
stop-admin-dev: ## stop application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.dev.admin.yml down

.PHONY: launch-webapp-dev
launch-webapp-dev: docker-clean ## launch the multi-container on local machine
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.dev.api.yml \
		-f docker-compose/docker-compose.local.dev.app.yml up

.PHONY: stop-webapp-dev
stop-webapp-dev: ## stop application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.local.dev.api.yml \
		-f docker-compose/docker-compose.local.dev.app.yml down

.PHONY: help
help:  ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif

# .env.public for common environment variables
ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

CONTAINER_APP_FOLDER = /app

PROJECT_NAME             := $(PROJECT_NAME)
COMPOSE_PROJECT_NAME     := $(COMPOSE_PROJECT_NAME)
# Available platforms: linux/amd64 | linux/arm64/v8 | linux/x86_64 | linux/arm/v7
PLATFORM                 := $(PLATFORM)

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

DEV_VOLUME = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/node_modules \
	-v $(COMPOSE_PROJECT_NAME)-webapp-packages:$(CONTAINER_APP_FOLDER)/node_modules

.PHONY: docker-clean build-dev build-prod interactive run-storybook install-dependencies \
	lint unit-tests commit npm-audit help

docker-clean: ## 🧹 Stop+kill containers, prune stopped, remove untagged images
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach-object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill; docker container prune --force; docker system prune --force;
endif

build-dev: ## 🛠️ Build dev container image for webapp
	docker build --platform $(PLATFORM) --target development \
		-t $(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev .

build-prod: ## 🛠️ Build production container image for webapp
	docker build \
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

interactive: ## 🧑‍💻 Open interactive shell in dev container
	docker run -it --rm --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash

run-storybook: ## 📚 Run Storybook server (port 6006)
	docker run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		-p "6006:6006" \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run storybook -- --no-open --host 0.0.0.0"

install-dependencies: ## 📦 Install Node dependencies into volume for dev
	docker run -t --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm install"

lint: ## 🔍 Run linter
	docker run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run lint"

unit-tests: ## 🧪 Run all unit tests (watch)
	docker run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run test:watch"

commit: ## 📝 Conventional commit workflow
	docker run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run commit"

npm-audit: ## 🛡️ Run npm audit and attempt fixes
	docker run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm audit fix --force"

help:  ## ❓ Show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif

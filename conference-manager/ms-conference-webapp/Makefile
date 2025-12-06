# .env.public for common environment variables
ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := cm-webapp-help # when you run make, it defaults to printing available commands

CONTAINER_APP_FOLDER = /app

COMPOSE_PROJECT_NAME = ms-conference
# Available platforms: linux/amd64 | linux/arm64/v8 | linux/x86_64 | linux/arm/v7
PLATFORM = linux/arm64/v8

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

DEV_VOLUME = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/node_modules \
	-v $(COMPOSE_PROJECT_NAME)-webapp-packages:$(CONTAINER_APP_FOLDER)/node_modules

.PHONY: cm-webapp-docker-clean cm-webapp-build-dev cm-webapp-build-prod cm-webapp-interactive cm-webapp-run-storybook \
	cm-webapp-install-dependencies cm-webapp-lint cm-webapp-unit-tests cm-webapp-commit cm-webapp-npm-audit \
	cm-webapp-help

cm-webapp-docker-clean: ## 🧹 Stop+kill containers, prune stopped, remove untagged images
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach-object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill; docker container prune --force; docker system prune --force;
endif

cm-webapp-build-dev: ## 🛠️ Build dev container image for webapp
	docker build --platform $(PLATFORM) --target development \
		-t $(COMPOSE_PROJECT_NAME)-webapp-dev .

cm-webapp-build-prod: ## 🛠️ Build production container image for webapp
	docker build \
		--build-arg REACT_APP_BASE_PATH=${REACT_APP_BASE_PATH} \
		--platform $(PLATFORM) . \
		-t $(COMPOSE_PROJECT_NAME)-webapp

cm-webapp-interactive: ## 🧑‍💻 Open interactive shell in dev container
	docker run -it --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash

cm-webapp-run-storybook: ## 📚 Run Storybook server (port 6006)
	docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		-p "6006:6006" \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run storybook -- --no-open --host 0.0.0.0"

cm-webapp-install-dependencies: ## 📦 Install Node dependencies into volume for dev
	docker run -t --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm install"

cm-webapp-lint: ## 🔍 Run linter
	docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run lint"

cm-webapp-unit-tests: ## 🧪 Run all unit tests (watch)
	docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run test:watch"

cm-webapp-commit: ## 📝 Conventional commit workflow
	docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run commit"

cm-webapp-npm-audit: ## 🛡️ Run npm audit and attempt fixes
	docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm audit fix --force"

cm-webapp-help:  ## ❓ Show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif

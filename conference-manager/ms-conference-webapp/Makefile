# .env.public for common environment variables
ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

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

.PHONY: docker-clean
docker-clean: ## stop+kill all running containers. prune stopped containers. remove all untagged images
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach-object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill; docker container prune --force; docker system prune --force;
endif

.PHONY: build-dev-webapp
build-dev-webapp: ## build dev container image for webapp
	docker build --platform $(PLATFORM) --target development \
		-t $(COMPOSE_PROJECT_NAME)-webapp-dev .

.PHONY: build-webapp
build-webapp: ## build container image for webapp
	docker build \
		--build-arg REACT_APP_BASE_PATH=${REACT_APP_BASE_PATH} \
		--platform $(PLATFORM) . \
		-t $(COMPOSE_PROJECT_NAME)-webapp

.PHONY: interactive-webapp
interactive-webapp: ## get a bash shell in the container
	docker run -it --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash

.PHONY: run-storybook
run-storybook: ## run storybook
	docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		-p "6006:6006" \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run storybook -- --no-open --host 0.0.0.0"

.PHONY: install-dependencies-webapp
install-dependencies-webapp: ## install node packages for webapp dev server into volume
	docker run -t --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm install"

.PHONY: lint-webapp
lint-webapp: ## run linter for webapp
	docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run lint"

.PHONY: unit-tests-webapp
unit-tests-webapp: ## run all unit tests for webapp
	docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run test:watch"

.PHONY: commit
commit: ## use conventional commits to commit changes
	docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run commit"

.PHONY: help
help:  ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif

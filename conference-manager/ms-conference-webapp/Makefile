# .env.public for common environment variables
ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

CONTAINER_RUNTIME ?= docker
ifeq ($(filter $(CONTAINER_RUNTIME),docker podman container),)
$(error CONTAINER_RUNTIME must be docker, podman, or container)
endif

.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

CONTAINER_APP_FOLDER = /app

PROJECT_NAME             := $(PROJECT_NAME)
COMPOSE_PROJECT_NAME     := $(COMPOSE_PROJECT_NAME)
# Available platforms: linux/amd64 | linux/arm64/v8 | linux/x86_64 | linux/arm/v7
PLATFORM                 := $(PLATFORM)
# For CI
IMAGE_NAME               ?= $(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp
IMAGE_TAG                ?= latest

DIR := "$$(pwd)"

DEV_VOLUME = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/node_modules \
	-v $(COMPOSE_PROJECT_NAME)-webapp-packages:$(CONTAINER_APP_FOLDER)/node_modules

.PHONY: docker-clean build-dev build-prod interactive run-storybook \
	install-dependencies lint unit-tests commit npm-audit dev stop launch-detached help

dev: build-dev install-dependencies launch ## 🚀 Build image, install deps, and launch webapp in dev container

docker-clean: ## 🧹 Stop+kill containers, prune stopped, remove untagged images
	@ids=$$($(CONTAINER_RUNTIME) ps -qa); \
	if [ -n "$$ids" ]; then printf '%s\n' $$ids | xargs $(CONTAINER_RUNTIME) kill; fi; \
	$(CONTAINER_RUNTIME) container prune --force; \
	$(CONTAINER_RUNTIME) system prune --force

build-dev: ## 🛠️ Build dev container image for webapp
	$(CONTAINER_RUNTIME) build --platform $(PLATFORM) --target development \
		-t $(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev .

build-prod: ## 🛠️ Build production container image for webapp (no layer cache)
	$(CONTAINER_RUNTIME) build --no-cache \
		--build-arg NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH} \
		--build-arg NEXT_PUBLIC_VERSION=${NEXT_PUBLIC_VERSION} \
		--build-arg NEXT_PUBLIC_API_KEY=${NEXT_PUBLIC_API_KEY} \
		--build-arg NEXT_PUBLIC_AUTH_DOMAIN=${NEXT_PUBLIC_AUTH_DOMAIN} \
		--build-arg NEXT_PUBLIC_DATABASE_URL=${NEXT_PUBLIC_DATABASE_URL} \
		--build-arg NEXT_PUBLIC_PROJECT_ID=${NEXT_PUBLIC_PROJECT_ID} \
		--build-arg NEXT_PUBLIC_STORAGE_BUCKET=${NEXT_PUBLIC_STORAGE_BUCKET} \
		--build-arg NEXT_PUBLIC_MESSAGING_SENDER_ID=${NEXT_PUBLIC_MESSAGING_SENDER_ID} \
		--build-arg NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID} \
		--build-arg NEXT_PUBLIC_MEASUREMENT_ID=${NEXT_PUBLIC_MEASUREMENT_ID} \
		--platform $(PLATFORM) . \
		-t $(IMAGE_NAME):$(IMAGE_TAG)

interactive: ## 🧑‍💻 Open interactive shell in dev container
	$(CONTAINER_RUNTIME) run -it --rm --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash

launch: ## 🚀 Launch webapp in dev container (only nextjs)
	$(CONTAINER_RUNTIME) run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		-p "8090:3000" \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run dev"

launch-detached: ## 🚀 Launch webapp in dev container (detached, no TTY — for CI/scripts)
	$(CONTAINER_RUNTIME) run -d --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		-p "8090:3000" \
		--name $(COMPOSE_PROJECT_NAME)-webapp-dev \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run dev"

stop: ## 🛑 Stop running webapp dev container
	@ids=$$($(CONTAINER_RUNTIME) ps -q --filter ancestor=$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev); \
	if [ -n "$$ids" ]; then printf '%s\n' $$ids | xargs $(CONTAINER_RUNTIME) stop; fi

run-storybook: ## 📚 Run Storybook server (port 6006)
	$(CONTAINER_RUNTIME) run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		-p "6006:6006" \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run storybook -- --no-open --host 0.0.0.0"

install-dependencies: ## 📦 Install Node dependencies into volume for dev
	$(CONTAINER_RUNTIME) run -t --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm install"

lint: ## 🔍 Run linter
	$(CONTAINER_RUNTIME) run -t --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run lint"

unit-tests-watch: ## 🧪 Run all unit tests in watch mode
	$(CONTAINER_RUNTIME) run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run test:watch"

unit-tests: ## 🧪 Run all unit tests
	$(CONTAINER_RUNTIME) run -t --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run test:ci"

commit: ## 📝 Conventional commit workflow
	$(CONTAINER_RUNTIME) run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm run commit"

npm-audit: ## 🛡️ Run npm audit and attempt fixes
	$(CONTAINER_RUNTIME) run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME)-webapp-dev /bin/ash -ci "npm audit fix --force"

help:  ## ❓ Show all make commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

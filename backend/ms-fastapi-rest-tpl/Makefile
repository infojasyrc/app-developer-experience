# use an environment file to use standard configuration
ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

COMPOSE_PROJECT_NAME = ms-fastapi-rest-tpl
CONTAINER_APP_FOLDER = /app

# available platforms linux/amd64 | linux/arm64/v8 | linux/x86_64
PLATFORM = linux/arm64/v8

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

# include codebase and dependencies to run the container in development mode
DEV_VOLUME = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/.venv \
	-v $(COMPOSE_PROJECT_NAME)-packages:$(CONTAINER_APP_FOLDER)/.venv

.PHONY: docker-clean
docker-clean: ## stop and kill all running containers
ifeq ($(OS),Windows_NT)
	powershell "docker ps -qa | foreach object {docker kill $$_}; docker container prune --force; docker system prune --force;"
else
	docker ps -qa | xargs docker kill; docker container prune --force; docker system prune --force;
endif

.PHONY: build-dev
build-dev: ## build docker image for local development
	docker build --platform $(PLATFORM) --target dev \
		-t $(COMPOSE_PROJECT_NAME) .

.PHONY: interactive
interactive: ## get a bash shell in the container
	docker run -it --rm --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME) /bin/ash -ci "source .venv/bin/activate && exec ash"

.PHONY: install-dependencies
install-dependencies: ## install packages from pipfile
	docker run -it --rm --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME) /bin/ash -ci "poetry lock && poetry install --with dev --no-root"

.PHONY: launch-local
launch-local: ## launch application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.yml up

.PHONY: stop-local
stop-local: ## stop application for local development
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml -f docker-compose/docker-compose.local.yml down

.PHONY: help
help:  ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif
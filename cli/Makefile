ENV_FILE = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")

include $(ENV_FILE)

.DEFAULT_GOAL := help # when you run make, it defaults to printing available commands

CONTAINER_APP_FOLDER = /app
COMPOSE_PROJECT_NAME = app-dev-xp
# Available platforms: linux/amd64 | linux/arm64/v8 | linux/x86_64 | linux/arm/v7
PLATFORM = linux/arm64/v8

ifeq ($(OS),Windows_NT)
	DIR := $(shell powershell "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('.').ShortPath")
else
	DIR := "$$(pwd)"
endif

DEV_VOLUME = \
	-v $(DIR):$(CONTAINER_APP_FOLDER) \
	-v $(CONTAINER_APP_FOLDER)/.venv \
	-v $(COMPOSE_PROJECT_NAME)-cli-packages:$(CONTAINER_APP_FOLDER)/.venv

.PHONY: build
build: ## build image for cli
	docker build --platform $(PLATFORM) --target build \
		-t $(COMPOSE_PROJECT_NAME)-cli-dev .

.PHONY: interactive
interactive: ## get a bash shell in the container
	docker run -it --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-cli-dev /bin/sh

.PHONY: install-dependencies
install-dependencies: ## install all dependencies
	docker run -it --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-cli-dev /bin/sh -ci "pipenv install --dev"

.PHONY: cli
cli: ## basic message
	docker run -it --net=host --workdir="$(CONTAINER_APP_FOLDER)/src" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		--env GIT_PYTHON_REFRESH=$(GIT_PYTHON_REFRESH) \
		$(COMPOSE_PROJECT_NAME)-cli-dev /bin/sh -ci "pipenv run python main.py"

.PHONY: basic-commit
basic-commit: ## basic commit
	ifeq ($(m),)
		$(error m is not set)
	endif
	docker run -it --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-cli-dev /bin/sh -ci "pipenv run python src/main.py commit -m $(m)"

.PHONY: interactive-commit
interactive-commit: ## interactive commit
	docker run -it --net=host --workdir="$(CONTAINER_APP_FOLDER)" \
		--platform $(PLATFORM) \
		$(DEV_VOLUME) \
		$(COMPOSE_PROJECT_NAME)-cli-dev /bin/sh -ci "pipenv run python src/main.py commit"

.PHONY: help
help:  ## show all make commands
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
endif
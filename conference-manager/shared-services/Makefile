## Makefile for shared-services (resources shared by cm-api and cm-admin)
## Conventions: targets use hyphenated verbs, documented with '##' for help discovery.

# .env.public for common environment variables (fallback when .env absent)
ENV_FILE                 = $(shell [ -e ".env" ] && echo ".env" || echo ".env.public")
include $(ENV_FILE)

.DEFAULT_GOAL            := help

COMPOSE_PROJECT_NAME     := $(COMPOSE_PROJECT_NAME)
PLATFORM                 := $(PLATFORM)
DOCKER_COMPOSE           = docker compose
NETWORK_NAME             = $(COMPOSE_PROJECT_NAME)-network
DB_VOLUME_NAME           = $(COMPOSE_PROJECT_NAME)-dev-db
DB_COMPOSE               = $(DOCKER_COMPOSE) --env-file $(ENV_FILE) -p $(COMPOSE_PROJECT_NAME)-db \
	-f docker-compose/docker-compose.db.yml

.PHONY: help create-network create-volumes launch-db stop-db reset-db logs-db

create-network: ## 🌐 Create shared container network if it does not exist
	@docker network inspect $(NETWORK_NAME) >/dev/null 2>&1 || \
		(echo "Creating network: $(NETWORK_NAME)" && docker network create $(NETWORK_NAME))

create-volumes: create-network ## 📦 Create shared database volume if it does not exist
	@docker volume inspect $(DB_VOLUME_NAME) >/dev/null 2>&1 || \
		(echo "Creating volume: $(DB_VOLUME_NAME)" && docker volume create $(DB_VOLUME_NAME))

launch-db: create-volumes ## 🗄️ Launch shared MongoDB (idempotent, waits until healthy)
	$(DB_COMPOSE) up -d --wait

stop-db: ## 🛑 Stop shared MongoDB (affects cm-api AND cm-admin)
	$(DB_COMPOSE) down

reset-db: stop-db ## 🗑️ Stop shared MongoDB and wipe its data volume (affects cm-api AND cm-admin, dev only)
	docker volume rm $(DB_VOLUME_NAME)
	@$(MAKE) --no-print-directory create-volumes

logs-db: ## 📜 Tail shared MongoDB logs
	$(DB_COMPOSE) logs -f

help: ## List available make targets
ifeq ($(OS),Windows_NT)
	powershell "((type Makefile) -match '##') -notmatch 'grep'"
else
	@grep -hE '^[a-zA-Z0-9_.-]+:.*##' $(MAKEFILE_LIST) | awk -F':|##' '{printf "\033[36m%-30s\033[0m %s\n", $$1, $$3}' | sort
endif

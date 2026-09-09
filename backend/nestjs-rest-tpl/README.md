# Microservice Nestjs REST Template

This project is a template for microservices using nestjs with hexagonal architecture.

## What is it

This is microservice built with nodejs and nestjs

## Contents

- [Microservice Nestjs REST Template](#microservice-nestjs-rest-template)
  - [What is it?](#what-is-it)
- [Contents](#contents)
- [Application Architecture](#application-architecture)
- [Project Dependencies](#project-dependencies)
- [Getting started](#getting-started)
  - [Environment Configuration](#environment-configuration)
  - [Launch application using containers](#launch-application-using-containers)
- [Conventional commits](#conventional-commits)
  - [Structural Elements](#structural-elements)
  - [Usage](#usage)
  - [Working and link Jira/Trello cards](#working-and-link-jira/trello-cards)
- [Team Standards](#team-standards)

## Application Architecture

TODO: Add here the evolution of our architecture.

## Project Dependencies

Host tools only:

- Docker
- Make

Do not install Node, nvm, or npm on the host. The container image uses Node 20.18.1 (`ARG NODE_VERSION` in the Dockerfile).

## Getting started

All install, lint, test, and run work happens inside Docker via Make.

### Environment Configuration

The Makefile loads `.env` if it exists, otherwise `.env.public`. To override defaults locally, copy `.env.public` to `.env` and edit the copy.

| Variable                             | Description                                                                 | Required | Default Value        |
| ------------------------------------ | --------------------------------------------------------------------------- | -------- | -------------------- |
| HTTP_PORT                            | HTTP server listening port                                                  | No       | 4000                 |
| INTEGRATION_ENVIRONMENT_URL_LIVENESS | Liveness URL for downstream integrations                                    | No       |                      |
| INTEGRATION_API_TOKEN                | Token for downstream integrations                                           | No       |                      |
| UNLEASH_API_URL                      | Unleash feature-toggle API URL                                              | No       |                      |
| UNLEASH_API_TOKEN                    | Unleash API token                                                           | No       |                      |
| COMPOSE_PROJECT_NAME                 | Docker Compose project name                                                 | Yes      | nestjs-rest-tpl      |
| PLATFORM                             | Docker platform. Allowed: `linux/amd64`, `linux/arm64`, `linux/x86_64`      | Yes      | linux/amd64          |
| POSTGRES_USER                        | App Postgres user (`docker-compose.db.yml`)                                 | Yes      | postgres             |
| POSTGRES_PASSWORD                    | App Postgres password                                                       | Yes      | some_password        |
| POSTGRES_DB                          | App Postgres database name                                                  | Yes      | postgres             |
| UNLEASH_DB_NAME                      | Unleash Postgres database name                                              | Yes      | unleash              |
| UNLEASH_DB_USERNAME                  | Unleash Postgres user                                                       | Yes      | unleash_user         |
| UNLEASH_DB_PASSWORD                  | Unleash Postgres password                                                   | Yes      | some_password        |

On Apple Silicon you may set `PLATFORM=linux/arm64` in a local `.env` for faster builds. The default `linux/amd64` matches CI and cloud.

### Launch application using containers

`make create-volumes` is required on first run (and after deleting container volumes). It creates the packages volume plus external Postgres 18 volumes for the app DB (`…-db-data`) and Unleash (`…-unleash-db-data`). Run it before `make launch-db` or `make launch-unleash`. Old compose-managed `ms_db` / `unleash_db` volumes are not reused — remove them if they exist. `make lint` and `make unit-tests` need a prior `make install-dependencies` so the named volume has packages.

```bash
make create-volumes          # once (packages + app DB + Unleash DB)
make build-dev
make install-dependencies
make launch-local
make lint
make unit-tests
make stop-local
```

Other useful targets:

```bash
make help            # list all targets
make interactive     # shell inside the container
make build-prod      # production image
make launch-db       # app Postgres only
make stop-db
make launch-unleash  # Unleash + Unleash Postgres
make stop-unleash
```

The local stack publishes the app on port 8080 (`docker-compose/docker-compose.local.yml`).

## Conventional commits

Specification that provides a convention in commit messages and fits with [SemVer](https://semver.org/) describing in
commit messages

### Structural Elements

Every commit, must have a message to communicate it's intent to other developers who read the commit history

The structure of commit messages should be like:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Usage

The following steps should be selected according to the type of commit.

- `git add [path/to/file.extension]`
- `git cz ` this will open a console to select:
- `type`
- `scope/context`
- `shor description of commits do (80 character permited) `
- `large description of commits do `
- `BREAKING CHANGES`
- `open issues affected`

Note: This library is disabled temporaly

### Working and link Jira/Trello cards

To trace our work with the git commit history, we can link our commits with Trello or Jira providing this way:

#### Azure DevOps

`feat: add new implementation to Xyz (123)` being `123` Trello card

## Team Standards

This template follows the ADE-wide team standards instead of its own copy:

- [Commit types](../../docs/standards/commit-types.md)
- [Branch naming](../../docs/standards/branching.md)
- [Pull request process](../../docs/standards/pull-requests.md)

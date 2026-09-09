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
  - [Proposals Type Commits](#proposals-type-commit)
  - [Usage](#usage)
  - [Working and link Jira/Trello cards](#working-and-link-jira/trello-cards)
- [Team agreements](#team-agreements)
  - [Branch Naming](#branch-naming)
- [Pull Request Process](#pull-request-process)
  - [PR Structure](#pr-structure)
  - [Work In Progress](#work-in-progress)
  - [PR Automation](#pr-automation)

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

### Proposals Type Commits

- `feat`: Introduces a new feature to the codebase (this correlates with MINOR in [SemVer](https://semver.org/)).

  `feat: add new implementation to Xyz`

- `fix`: Patches a bug in the codebase (this correlates with PATCH in [SemVer](https://semver.org/)).

  `fix: change constant value CONSTANT_XYZ in Xyz class`

- `build`: Changes that affect the build system or dependencies (npm, gradle, etc)

  `build: change database driver version`

- `ci`: Continuous Integration configuration changes in files/scripts (GitLab CI, GitHub Actions)

  `ci: change config in .circleci adding a code-lint job `

- `docs`: Documentation files changes (Readme.md)

  `docs: change Readme.md adding info to local deploy`

- `perf`: Improves the performance

  `perf: delete boilerplate implementation in Xyz`

- `refactor`: Code that neither fixes a bug/feature

  `refactor: delete boilerplate implementation in Xyz`

- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)

  `style: change the tabulation format in Xyz`

- `test`: Adding missing tests or correcting existing ones

  `test: add missing test to Xyz implementation`

- `chore`: Other changes that don't modify src or test files

  `chore: ignore X file in .gitignore `

- `revert`: Reverts a previous commit

  `revert: reverts a1s2d3f4g5 commit `

- `wip`: Changes to commit that haven't yet finished

  `wip: Xyz class refactor `

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

## Team Agreements

### Branch Naming

According to our branch strategy: trunk based development, each developer will create a feature branch will the following pattern:

user/typeoftask/task-name

As an example: jose/feat/add-team-agreements-in-docs

## Pull Request Process

### PR Structure

As part of our definition of DONE and our team agreements, when a development submit all changes and create a pull request, this should follow:

```
title: [TEAM_ACRONYM-Number] User story title
description: Summarize all the changes within a detail list.

Choose a label for each pull request: enhancement, bug
```

### Work In Progress

To maximize the visibility of our progress, as a team, we can use two options:

- Use WIP prefix on the pull request, which means: Work in progress
- Use draft pull request when it is created

### PR Automation

TODO: As a team, we need to:

- Look for a way to automate this process using github-cli

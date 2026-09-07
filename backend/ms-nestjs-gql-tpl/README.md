# Microservice Nestjs Template

This project is a template for microservices using nestjs with hexagonal architecture.

## What is it

This is microservice built with nodejs and nestjs

## Contents

- [Microservice Nestjs Template](#microservice-nestjs-template)
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
| COMPOSE_PROJECT_NAME                 | Docker Compose project name                                                 | Yes      | ms-nestjs-gql-tpl    |
| PLATFORM                             | Docker platform. Allowed: `linux/amd64`, `linux/arm64`, `linux/x86_64`      | Yes      | linux/amd64          |

On Apple Silicon you may set `PLATFORM=linux/arm64` in a local `.env` for faster builds. The default `linux/amd64` matches CI and cloud.

### Launch application using containers

`make create-volumes` is required on first run (and after deleting Docker volumes). `make lint` and `make unit-tests` need a prior `make install-dependencies` so the named volume has packages.

```bash
make create-volumes          # once
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

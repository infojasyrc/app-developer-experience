# Conference Manager

This is an application to give talks about software development

## Content

- [Content](#content)
- [Components](#components)
- [Getting started](#getting-started)
  - [Shared database](#shared-database)
  - [Run API](#run-api)
  - [Run Admin](#run-admin)
  - [Run all components](#run-all-components)

## Components

Project aliases (`cm-api`, `cm-webapp`, `cm-admin`, `cm-tools`) are used in branches, commits, and pull requests. They are not folder names — see `agents/shared/context/monorepo-paths.md`.

### API: `backend` (`cm-api`)

This service is organized by `backend` and handle all REST operations.
This service is a legacy code using nodejs with javascript and nestjs.

### Admin: `admin` (`cm-admin`)

This service is organized by `admin` and handles the database management.
This service is using fastapi to create the admin dashboard.

### Webapp: `webapp` (`cm-webapp`)

Next.js frontend for Conference Manager.

### Tools (`cm-tools`)

Observability and local tooling (Keycloak, Unleash, Prometheus, Grafana) live under `backend/` (compose + `tools/`). Local resources shared by several services, such as the MongoDB database, live in [`shared-services/`](shared-services/README.md). There is no `conference-manager-tools/` folder.

## Getting started

Use make command to list all available commands

```bash
make
```

### Shared database

`backend` and `admin` share one MongoDB instance, defined once in
[`shared-services/`](shared-services/README.md). Each service's `make launch-db` (also run by its
`launch-*` targets) delegates there and reuses the database if it is already running, so stopping one
service never stops the database used by the other. `make stop-db` and `make reset-db` affect both.

```bash
make -C shared-services create-volumes
make -C shared-services launch-db
```

Migrating from the previous per-service database: remove the old container once (the data volume is
kept and reused):

```bash
docker rm -f ms-conference-db
make -C shared-services create-volumes launch-db
```

### Run API

```bash
make -C backend build-dev
make -C backend create-volumes
make -C backend install-dependencies
make -C backend launch-local-dev
```

### Run Admin

```bash
make -C admin build-dev
make -C admin create-volumes
make -C admin install-dependencies
make -C admin launch-local
```

### Run Webapp

The webapp compose stack (webapp + storybook) also starts the API and Unleash:

```bash
make -C webapp build-dev
make -C webapp install-dependencies
make -C webapp launch-local-dev
make -C webapp stop-local-dev
```

### Run all components

Launches the shared database, the API (with Unleash) and the webapp:

```bash
make launch
make stop
```

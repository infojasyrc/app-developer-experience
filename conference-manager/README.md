# Conference Manager

This is an application to give talks about software development

## Content

- [Content](#content)
- [Components](#components)
- [Getting started](#getting-started)
  - [Run API](#run-api)
  - [Run Admin](#run-admin)

## Components

Project aliases (`cm-api`, `cm-webapp`, `cm-admin`, `cm-tools`) are used in branches, commits, and pull requests. They are not folder names — see `agents/shared/context/monorepo-paths.md`.

### API: `ms-conference-api` (`cm-api`)

This service is organized by `ms-conference-api` and handle all REST operations.
This service is a legacy code using nodejs with javascript and nestjs.

### Admin: `ms-conference-admin` (`cm-admin`)

This service is organized by `ms-conference-admin` and handles the database management.
This service is using fastapi to create the admin dashboard.

### Webapp: `ms-conference-webapp` (`cm-webapp`)

Next.js frontend for Conference Manager.

### Tools (`cm-tools`)

Observability and local tooling (Keycloak, Unleash, Prometheus, Grafana) live under `ms-conference-api/` (compose + `tools/`). There is no `conference-manager-tools/` folder.

## Getting started

Use make command to list all available commands

```bash
make
```

### Run API

```bash
make build-dev-api
make install-dependencies-api
make launch-api-local
```

### Run Admin

```bash
make build-dev-admin
make install-dependencies-admin
make launch-admin-local
```

### Run all components

TBD

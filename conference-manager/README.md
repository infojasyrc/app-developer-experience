# Conference Manager

This is an application to give talks about software development

## Content

- [Content](#content)
- [Microservices](#microservices)
- [Getting started](#getting-started)
  - [Run API](#run-api)
  - [Run Admin](#run-admin)

## Microservices

### API: ms-conference-api

This microservice is organized by `ms-conference-api` and handle all REST operations.
This microservice is a legacy code using nodejs with javascript and nestjs.

### Admin: ms-conference-admin

This microservice is organized by `ms-conference-admin` and handles the database management.
This microservice is using fastapi to create the admin dashboard.

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

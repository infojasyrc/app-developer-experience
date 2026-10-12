# Conference Manager Shared Services

Local resources shared by more than one Conference Manager service. Today it holds the
MongoDB database used by both `ms-conference-api` (`cm-api`) and `ms-conference-admin` (`cm-admin`).

## Content

- [How it works](#how-it-works)
- [Getting started](#getting-started)
- [Available targets](#available-targets)
- [Migrating from per-service databases](#migrating-from-per-service-databases)

## How it works

- The database runs as its own compose project, `${COMPOSE_PROJECT_NAME}-db`, defined in
  [docker-compose/docker-compose.db.yml](docker-compose/docker-compose.db.yml). Stopping cm-api or
  cm-admin never stops the database.
- The network `${COMPOSE_PROJECT_NAME}-network` and the volume `${COMPOSE_PROJECT_NAME}-dev-db` are
  external and created by `make create-volumes`, so every stack attaches to the same resources.
- Inside the network the database is reachable as `mongodb` (`DB_HOST=mongodb`); from the host use
  `localhost:${DB_PORT}`.
- cm-api and cm-admin expose `launch-db`, `stop-db` and `reset-db` targets that delegate to this
  Makefile, and their `launch-*` targets start the database first.

Credentials come from `.env` (or `.env.public` as fallback). `DB_*` and `DEFAULT_DB` must match the
values in `ms-conference-api/.env` and `ms-conference-admin/.env`; `MONGO_INITDB_*` is applied only
when the volume is empty.

## Getting started

```bash
make create-volumes
make launch-db
```

`make launch-db` is idempotent: if the database is already running (started by another service), it
leaves it as it is.

## Available targets

```bash
make help
```

| Target | Description |
|---|---|
| `create-network` | Create the shared network if it does not exist |
| `create-volumes` | Create the shared network and database volume if they do not exist |
| `launch-db` | Start MongoDB and wait until it is healthy |
| `stop-db` | Stop MongoDB — **affects cm-api and cm-admin** |
| `reset-db` | Stop MongoDB and wipe its data — **affects cm-api and cm-admin** |
| `logs-db` | Tail MongoDB logs |

## Migrating from per-service databases

Before this package, each service started `ms-conference-db` inside its own stack. Remove that
container once; the data volume is kept and reused:

```bash
docker rm -f ms-conference-db
make create-volumes
make launch-db
```

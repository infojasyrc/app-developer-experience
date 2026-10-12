# Conference Manager Admin

This is a microservice to handle all data with django admin and mongodb

## Content

- [Content](#content)
- [Getting started](#getting-started)
- [Dependency management](#dependency-management)
- [Shared database](#shared-database)
- [Project structure](#project-structure)
- [Team Standards](#team-standards)
- [Additional information](#additional-information)

## Getting started

Everything runs in containers through Make; no host Python or `uv` is required.
Dependencies are managed with `uv` (`pyproject.toml` + `uv.lock`) and installed only inside the container.

```bash
# list available targets
make help
# build container for development
make build-dev
# create the packages volume and the shared network/database volume
make create-volumes
# install dependencies into the packages volume
make install-dependencies
# launch the shared database, run migrations and start the admin on http://localhost:3001
make launch-local
# lint and unit tests (80% minimum coverage)
make lint
make unit-tests
# tail logs
make logs
# stop the admin (the shared database keeps running)
make stop-local
```

To run the production image locally:

```bash
make build-prod
make launch-prod
make stop-prod
```

### Make targets

| Target | Purpose |
|---|---|
| `make build-dev` | build the `dev` image (uv + dev tooling) |
| `make build-prod` | build the `prod` image (runtime venv + source only) |
| `make create-volumes` | create the packages volume and the shared network/database volume |
| `make install-dependencies` | `uv lock && uv sync --group dev` inside the container volume |
| `make lint` | `black`, `isort` and `flake8` checks |
| `make format` | apply `black` and `isort` |
| `make unit-tests` | `pytest` with coverage (fails under 80%) |
| `make launch-local` / `make stop-local` | run migrations and the admin with source mounted |
| `make launch-prod` / `make stop-prod` | run the production image locally |
| `make interactive` | shell inside the dev container with the venv activated |
| `make logs` | tail local logs |
| `make launch-db` / `make stop-db` / `make reset-db` | shared MongoDB |
| `make docker-clean` | kill containers and prune images |

## Dependency management

- Edit dependencies in [`pyproject.toml`](pyproject.toml); `make install-dependencies` regenerates
  [`uv.lock`](uv.lock). Commit both files.
- `constraint-dependencies` pins minimum versions of transitive packages that had security advisories.
- After changing Python or dependencies, rebuild with `make build-dev` and, if the old virtualenv
  misbehaves, recreate the packages volume: `docker volume rm <COMPOSE_PROJECT_NAME>-admin-packages && make create-volumes`.

## Shared database

MongoDB is shared with `ms-conference-api` and is defined once in
[`../shared-services`](../shared-services/README.md). `make launch-db`, `make stop-db` and
`make reset-db` delegate to it:

- `make launch-db` (also run by `launch-local` / `launch-prod`) is idempotent and reuses the
  database if `ms-conference-api` already started it.
- `make stop-local` / `make stop-prod` do not stop the database.
- `make stop-db` and `make reset-db` affect **both** services.
- `DB_*` and `DEFAULT_DB` in `.env` must match `shared-services` and `ms-conference-api`.
  Use `DB_HOST=mongodb` when running in containers.
- Headquarters seeded from the API (`make -C ../ms-conference-api seed-data`) land in the same
  `headquarters` collection the admin reads; field names still differ between both services.

## Project structure

```text
ms-conference-admin/
├── pyproject.toml      # Python dependencies and tool config
├── uv.lock             # Python lock for dependencies
├── Dockerfile          # multi-stage: dev, build, prod
├── docker-compose/     # local and prod compose files
└── src/
    ├── manage.py
    ├── quickstart/     # Django project: settings, urls, environment
    ├── manager/        # app: models, admin, views
    └── mongo_migrations/  # MongoDB-specific migrations for admin, auth, contenttypes
```

## Team Standards

This template follows the following standards:

- [Commit types](../../docs/standards/commit-types.md)
- [Branch naming](../../docs/standards/branching.md)
- [Pull request process](../../docs/standards/pull-requests.md)

## Additional information

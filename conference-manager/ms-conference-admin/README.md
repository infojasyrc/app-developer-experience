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
# create the Django admin superuser (interactive; requires the admin to be running)
make createsuperuser
# lint and unit tests (80% minimum coverage)
make lint
make unit-tests
# tail logs
make logs
# stop the admin (the shared database keeps running)
make stop-local
```

### First-time Django setup

1. Run `make build-dev`, `make create-volumes`, `make install-dependencies` and `make launch-local`.
   `launch-local` starts the shared MongoDB and a one-shot `migrations` service
   (`python manage.py migrate`) before the admin starts.
2. Run `make createsuperuser` and enter a username, email and password.
3. Open <http://localhost:3001/admin/>, which redirects to the login page
   ("Django administration"), and sign in with that superuser.

Run any other `manage.py` command inside the container with
`make interactive` and then `cd src && python manage.py <command>`.

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
| `make createsuperuser` | create the Django admin superuser in the running container |
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
- The admin shows, read-only, the `headquarters` and `conferences` collections written by
  `ms-conference-api`. The Django models in [`src/manager/models.py`](src/manager/models.py) map the
  API's camelCase fields with `db_column` and are `managed = False`: the API owns the schema and writes.
  `src/manager/tests.py` fails if the model columns drift from the API schema.
- To see data in the admin, seed from the API (single source:
  `ms-conference-api/src/infrastructure/seed/seed.data.ts`):

  ```bash
  make launch-db
  make -C ../ms-conference-api seed-data
  make launch-local
  ```

  Then open <http://localhost:3001/admin/manager/headquarter/> and
  <http://localhost:3001/admin/manager/conference/>.

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

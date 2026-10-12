# Conference Manager Admin

This is a microservice to handle all data with django admin and mongodb

## Content

- [Content](#content)
- [Getting started](#getting-started)
- [Shared database](#shared-database)
- [Project structure](#project-structure)
- [Team Standards](#team-standards)
- [Additional information](#additional-information)

## Getting started

Everything runs in containers through Make; no host Python or `pipenv` is required.

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
- Headquarters seeded from the API (`make -C ../ms-conference-api seed-data`) are visible in the admin.

## Project structure

## Team Standards

This template follows the following standards:

- [Commit types](../../docs/standards/commit-types.md)
- [Branch naming](../../docs/standards/branching.md)
- [Pull request process](../../docs/standards/pull-requests.md)

## Additional information

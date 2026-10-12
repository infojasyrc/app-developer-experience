# Launch application standalone

This way of development launches each component individually: DATABASE and API. Everything runs in
containers through Make; no host Node.js, `nvm` or `yarn` is required.

## Database

The MongoDB database is shared with `ms-conference-admin` and lives in
[`../shared-services`](../../../shared-services/README.md). Create the shared network and volumes, then
launch ONLY the database:

```bash
make create-volumes
make launch-db
```

`make launch-db` delegates to `shared-services` and is idempotent: if `ms-conference-admin` already
started the database, it keeps using the running instance. Remember to customize the `DB_*` values in
`.env`; they must match `shared-services` and `ms-conference-admin`.

- `make stop-db` stops the database for **both** services.
- `make reset-db` wipes the shared data volume for **both** services (dev only).

## API

Build the development image and install dependencies into the packages volume:

```bash
make build-dev
make install-dependencies
```

- To run the full development stack with auto-reloading (API, Unleash, Keycloak, observability tools):

```bash
make launch-local-dev
```

- To run the production image locally:

```bash
make build-prod
make launch-local-prod
```

- To get a shell inside the development container (for example to run a one-off `yarn` script):

```bash
make interactive
```

## Seed data

With the database running, seed or clear users, headquarters and conferences:

```bash
make seed-data
make clear-data
```

Seeded headquarters land in the same `headquarters` collection read by the Django admin
(`ms-conference-admin`); field names still differ between both services.

## Run unit tests

```bash
make unit-tests
```

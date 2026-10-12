# Plan: Shared MongoDB for cm-api and cm-admin

## Goal
Run a single MongoDB instance for `ms-conference-api` (cm-api) and `ms-conference-admin` (cm-admin) from one
source of truth (`conference-manager/shared-services/`), so either service can start it idempotently and stopping
one service never tears down the database the other one is using.

## Scope
- Affected component(s): conference-manager (`cm-tools`, `cm-api`, `cm-admin`, `cm-webapp` root launch)
- Files to touch (estimate):
  - `conference-manager/shared-services/` [NEW] — `Makefile`, `.env.public`, `README.md`, `docker-compose/docker-compose.db.yml`
  - `conference-manager/ms-conference-api/` — `Makefile`, `.env.public`, `docker-compose/*.yml`, `README.md`, `docs/development/Local_Development.md`
  - `conference-manager/ms-conference-admin/` — `Makefile`, `.env.public`, `docker-compose/*.yml`, `README.md`
  - `conference-manager/Makefile`, `conference-manager/docker-compose/docker-compose.local.dev.web.yml`, `conference-manager/README.md`
  - `agents/shared/context/monorepo-paths.md` (new path alias)
  - `docker-compose/docker-compose.db.yml` in cm-api and cm-admin [DELETE]
- Out of scope (explicit):
  - Aligning collection names between services (admin writes conferences to `events`, the API to `conferences`; only `headquarters` is truly shared) — follow-up.
  - Fixing the unrelated `logs` target in the cm-api Makefile.
  - Cloud/production database topology.

## Baseline (findings)
- Both services include their own `docker-compose.db.yml` in the **same** compose project (`COMPOSE_PROJECT_NAME=ms-conference`)
  and create the same container (`ms-conference-db`), network (`ms-conference-network`) and volume (`ms-conference-dev-db`).
- `make stop-local` in cm-admin runs `down` and stops the database cm-api is using (and vice versa).
- The two files drifted: cm-api healthcheck uses `mongo` (removed from `mongo:8`, always unhealthy) and declares an unrelated
  `backend-packages` volume; cm-admin does not pin `platform`.
- Docs drifted: `conference-manager/README.md` references non-existent targets; `Local_Development.md` asks for host `nvm`/`yarn`.

## Contract / interface
- New package `conference-manager/shared-services/` driven by Make (ADR-0001):
  `create-network`, `create-volumes`, `launch-db`, `stop-db`, `reset-db`, `logs-db`, `help`.
- The database runs as its own compose project `$(COMPOSE_PROJECT_NAME)-db`; network `$(COMPOSE_PROJECT_NAME)-network`
  and volume `$(COMPOSE_PROJECT_NAME)-dev-db` are `external: true` and created by Make (existing data volume is reused).
- cm-api and cm-admin keep `launch-db` / `stop-db` / `reset-db` targets, delegating with `$(MAKE) -C ../shared-services`.
  Their `launch-*` targets depend on `launch-db` (`up -d --wait`) instead of compose `depends_on: mongodb`.
- Hostname `mongodb` keeps resolving through a network alias, so `DB_HOST=mongodb` does not change.

## Implementation steps (one Conventional Commit per step)
0. Branch `cm-tools/jose/feat/shared-mongodb-service` from `main`.
1. Add this plan — `docs(ade): add shared mongodb plan for conference manager`.
2. Create `shared-services/` + register path in `monorepo-paths.md` — `feat(cm-tools): add shared-services mongodb compose and makefile`.
3. cm-api delegates to shared DB, delete its `db.yml`, external network — `feat(cm-api): use shared-services mongodb instead of local compose` (`BREAKING CHANGE` footer).
4. cm-admin same — `feat(cm-admin): use shared-services mongodb instead of local compose`.
5. Root `conference-manager` launch/stop — `build(cm-webapp): attach root launch stack to shared mongodb`.
6. Docs — `docs(cm-api): …`, `docs(cm-admin): …`, `docs(cm-tools): …`.
7. Push branch and open PR.

## Pull request
- Branch: `cm-tools/jose/feat/shared-mongodb-service` → `main`.
- Body built from `.github/pull_request_template.md` (all headings kept): Project or Area ☑ cm-tools, cm-admin, cm-api, cm-webapp;
  Issue link → this plan; Type ☑ Feature, configuration files, development scripts, documentation;
  Current module / New behavior from Baseline / Contract; Breaking change ☑ Yes (one-time local migration). No AI-tool attribution.

## Risks
- The old `ms-conference-db` container (owned by project `ms-conference`) blocks the new `launch-db` by name →
  one-time migration: `docker rm -f ms-conference-db`.
- `stop-db` / `reset-db` from any service affects the other one → warned in `help` and READMEs.
- Credentials in service `.env` files must match `shared-services` → comment in each `.env.public`.

## Acceptance criteria
- [ ] Only one `ms-conference-db` container exists when both services run.
- [ ] Stopping cm-admin or cm-api leaves the database running; `stop-db` stops it for both.
- [ ] Headquarters seeded by cm-api (`make seed-data`) are visible in the Django admin.
- [ ] `docker compose config` is valid for every launch combination.
- [ ] `make lint` and `make unit-tests` pass in cm-api.
- [ ] READMEs describe the shared database workflow; no host `nvm`/`yarn` steps remain.

## Impacted consumers
- Developers running cm-api, cm-admin, or the root `conference-manager` stack locally.
- Agents resolving paths through `agents/shared/context/monorepo-paths.md`.

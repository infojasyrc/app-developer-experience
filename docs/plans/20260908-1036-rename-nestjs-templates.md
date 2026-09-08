# Plan: Rename NestJS template folders

## Goal

Drop the `ms-` prefix from the two NestJS bootstrap templates so folder names match the names already used in Nx, PR checkboxes, and branch examples (`nestjs-gql-tpl`, `nestjs-rest-tpl`). Update documentation, `make build-dev` identity (`COMPOSE_PROJECT_NAME`), and the backend pull-request workflow so day-to-day paths no longer point at the old folders.

## Scope

- Affected component(s): `backend/` NestJS templates, root scaffolding Makefile, docs/agent context, VS Code workspace, backend PR workflow (`pull_request_backend.yml` + `get-changed-packages.sh`).
- Files to touch (estimate): ~25 path/identity files after `git mv` of the two folders, plus deleting Sonar and REST changelog files.
- Out of scope (explicit):
  - `backend/ms-fastapi-*` (folders, README Python section, FastAPI CI jobs, FastAPI changelog script).
  - HTTP route prefix `ms-nestjs-template/v1` and Unleash `appName: 'ms-nestjs-template'` (runtime contract, not folder names).
  - [`.github/workflows/release.yml`](../../.github/workflows/release.yml), root changelog npm scripts, [`devops/tests/events_simulate_release_nestjs_tpl.json`](../../devops/tests/events_simulate_release_nestjs_tpl.json), and the release `act` examples in [`docs/Testing.md`](../Testing.md). Those stay on a later plan; leftover `ms-nestjs-rest-tpl` paths there are expected until then.
  - Path aliases `MS_NESTJS_REST` / `MS_NESTJS_GQL` (only their resolved paths change).

## Contract / interface

These packages are bootstrap templates, not runtime libraries. Consumers:

- Root `make create-nodejs-gql` / `make create-nodejs-rest` copy from `backend/$(NODEJS_*_FOLDER_TEMPLATE)`.
- CI `get-changed-packages` matches `backend/<folder>/`.
- Future services generated from the templates inherit the new `package.json` `name` and Docker image/volume names.

No public HTTP/GraphQL path change.

## Naming map

- `backend/ms-nestjs-gql-tpl` → `backend/nestjs-gql-tpl`
- `backend/ms-nestjs-rest-tpl` → `backend/nestjs-rest-tpl`
- `COMPOSE_PROJECT_NAME` / Docker image tag / named volume: `ms-nestjs-*-tpl` → `nestjs-*-tpl` (this is what `make build-dev` uses: `-t $(COMPOSE_PROJECT_NAME)`).
- npm package `name`: `ms-nestjs-*-tpl` → `nestjs-*-tpl` (required so root `create-nodejs-gql` sed still matches the folder template name).
- Nx `project.json` `sourceRoot` for REST: `backend/nestjs-rest-tpl`.

Also in this rename (not path aliases):

- Delete [`sonar-project.properties`](../../backend/ms-nestjs-rest-tpl/sonar-project.properties) from both templates (REST key `ms-nestjs-rest-tpl`, GQL key `ms-nestjs-template`). Sonar is not used for these templates.
- Delete REST [`CHANGELOG.md`](../../backend/ms-nestjs-rest-tpl/CHANGELOG.md). It is not a complete changelog; do not keep the historical commit list.

Local impact: after the rename, `make create-volumes` must be re-run. Old volumes `ms-nestjs-*-tpl-packages` are unused.

Makefile currently **overrides** `.env.public` (`COMPOSE_PROJECT_NAME = ...` after `include`). Update both so they stay equal.

## Pipeline review (PR workflow only)

[`get-changed-packages.sh`](../../.github/actions/get-changed-packages/get-changed-packages.sh) outputs component ids (`tpl-nestjs-rest`, `tpl-nestjs-gql`), not folder paths. [`pull_request_backend.yml`](../../.github/workflows/pull_request_backend.yml) already keys off those ids; only `working-directory` and the registry path prefixes need the new folders.

Leave FastAPI rows in `get-changed-packages.sh` and FastAPI jobs in that workflow untouched.

Do not edit `release.yml` or related release fixtures in this change.

## Implementation steps

Wait for confirmation. Then implement one step at a time. Use `git mv` so history is preserved. Uncommitted lint work already in these folders will move with the directories.

1. **Record the plan** in this file from [`docs/plans/TEMPLATE.md`](TEMPLATE.md).
2. **Rename folders**
   ```bash
   git mv backend/ms-nestjs-gql-tpl backend/nestjs-gql-tpl
   git mv backend/ms-nestjs-rest-tpl backend/nestjs-rest-tpl
   ```
3. **Align build-dev identity** in both templates: Makefile `COMPOSE_PROJECT_NAME`, `.env.public`, README env table, `package.json` / `package-lock.json` `name`, REST `project.json` `sourceRoot`. Align local compose `container_name` (`ms-rest-tpl` / `ms-gql-tpl` → `nestjs-rest-tpl` / `nestjs-gql-tpl`). Delete both `sonar-project.properties` files and REST `CHANGELOG.md`.
4. **Scaffolding + canonical paths**
   - Root [`Makefile`](../../Makefile): `NODEJS_GQL_FOLDER_TEMPLATE = nestjs-gql-tpl`, `NODEJS_REST_FOLDER_TEMPLATE = nestjs-rest-tpl`
   - [`agents/shared/context/monorepo-paths.md`](../../agents/shared/context/monorepo-paths.md) resolved paths, then [`CLAUDE.md`](../../CLAUDE.md) glob `cd backend/nestjs-*-tpl`
5. **Documentation and editor config** (path strings only): [`README.md`](../../README.md), [`backend/README.md`](../../backend/README.md), [`app-developer-experience.code-workspace`](../../app-developer-experience.code-workspace), [`docs/plans/20260908-standardize-nestjs-lint.md`](20260908-standardize-nestjs-lint.md), root README commit-scope example `ms-nestjs-rest` → `nestjs-rest-tpl`. Agent aliases in [`.cursor/rules/backend.mdc`](../../.cursor/rules/backend.mdc), [`AGENTS.md`](../../AGENTS.md), [`development-guidance.md`](../../agents/shared/context/development-guidance.md) stay; they already defer to `monorepo-paths.md`.
6. **Backend PR pipeline**: `get-changed-packages.sh` prefixes, `pull_request_backend.yml` working directories.
7. **Verify**: `rg 'ms-nestjs-(gql|rest)-tpl'` should only hit deferred release files (`release.yml`, changelog npm script, act fixture, Testing.md) plus HTTP/Unleash runtime strings (`ms-nestjs-template`). In each new template dir: `make create-volumes && make build-dev` (image tag `nestjs-*-tpl`). Do not run host `npm` in the templates.

Suggested commit after implementation: `chore: drop ms- prefix from NestJS template folders`

## Risks

- Local Docker volumes/images still named `ms-nestjs-*-tpl*` until developers recreate them.
- `release.yml` and the REST changelog npm script will still reference `backend/ms-nestjs-rest-tpl` until the follow-up release plan. That job is already gated on a path string that does not match `get-changed-packages` output, so this rename does not newly break releases.
- Uncommitted lint-standardize diffs in the old folders will ride along with `git mv`; keep them on this branch or stash first.

## Acceptance criteria

- [ ] Folders exist at `backend/nestjs-gql-tpl` and `backend/nestjs-rest-tpl`; old `ms-nestjs-*-tpl` dirs are gone.
- [ ] `COMPOSE_PROJECT_NAME` and `make build-dev` image tags are `nestjs-gql-tpl` / `nestjs-rest-tpl`.
- [ ] Canonical path file, CLAUDE.md, READMEs, workspace file, and NestJS PR CI paths use the new folders.
- [ ] Both `sonar-project.properties` files and REST `CHANGELOG.md` are removed.
- [ ] `release.yml` is untouched.
- [ ] `ms-fastapi-*` is unchanged.
- [ ] HTTP prefix and Unleash `appName` remain `ms-nestjs-template`.

## Impacted consumers

- Root `make create-nodejs-gql` / `make create-nodejs-rest` (copy source folder names).
- Backend PR CI (`get-changed-packages.sh` path prefixes, `pull_request_backend.yml` working directories).
- Developers with local Docker volumes/images named `ms-nestjs-*-tpl*` (must re-run `make create-volumes`).
- Future services generated from the templates (inherit new `package.json` `name` and Docker image/volume names).
- Docs and editor config that hardcode the old folder paths.
- Release workflow and changelog npm script: **not** updated here; they remain on old paths until a follow-up plan.

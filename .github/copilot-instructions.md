# App Developer Experience – AI Coding Agent Guide

This monorepo provides microservice and application templates plus a sample product (Conference Manager). Use these instructions to work efficiently and consistently.

## 1. Monorepo Layout & Intent
- Root uses `nx.json` only for directory layout (not full Nx targets): `appsDir=conference-manager`, `libsDir=backend` (template archetypes), `infrastructureDir=cloud`.
- `backend/` holds language/framework templates (NestJS REST, NestJS GraphQL, FastAPI REST). Treat them as archetypes to copy or reference; do not entangle runtime dependencies.
- `conference-manager/` is the active product composed of: `ms-conference-api` (NestJS REST, legacy JS), `ms-conference-admin` (FastAPI/Django-style admin), `ms-conference-webapp` (Next.js UI). They communicate over REST (API) and database (admin populates data consumed by API + webapp).
- `cli/` provides commit workflow helpers (Makefile targets wrapping conventional commit flows).
- `cloud/terraform/` contains infra modules (aws/azure/network). Avoid modifying unless implementing infra automation tasks.
- `devops/` contains commented Azure CI examples – placeholders (not active) for container build & push.

## 2. Core Development Workflows
- Prefer `make` targets over raw commands. Each service template and product component defines a Makefile with consistent verbs: `build-dev*`, `install-dependencies*`, `launch-*`, `stop-*`, `run-tests`.
- FastAPI template (`backend/ms-fastapi-rest-tpl`): Typical flow:
  ```bash
  make build-dev
  make install-dependencies
  make launch-local   # multi-container (API + DB)
  make run-tests
  ```
- NestJS REST template: Use npm scripts:
  ```bash
  npm run start:dev   # watch
  npm run test:unit
  npm run test:e2e
  npm run test:cov
  ```
- Conference Manager API (`ms-conference-api`): This is a legacy development `make build-dev && make install-dependencies && make launch-local-dev`
- Conference Manager Admin (`ms-conference-admin`): `make build-dev && make install-dependencies && make launch-local`.
- Conference Manager Webapp (`ms-conference-webapp`): `make build-dev && make install-dependencies`.
- Stop flows: use matching `make stop-*` target.
- Changelog generation scripts (root `package.json`): `yarn changelog:backend:fastapi-rest-tpl` / `yarn changelog:backend:nestjs-rest-tpl` (Angular preset, tag prefixes). Use after material feature/fix merges.

## 3. Environment & Configuration Patterns
- Node versions: Templates and API use Node 18 (check `.nvmrc` or Dockerfile). Root conventional commit tooling requires Node 22.15.0 (see root README). Switch via:
  ```bash
  nvm use 22.15.0   # for commit tooling at root
  nvm use           # inside service directory to respect local .nvmrc (API)
  ```
- API `.env` values control DB host. Container mode uses `mongodb` host; standalone uses `localhost`. Agents modifying env-sensitive code must preserve dual-mode compatibility.
- FastAPI template structure (primary source directories): `api/` (routes), `core/` (config), `schemas/`, `infrastructure/` (db, adapters), `use-cases/` (business logic), `main.py` entrypoint. Respect this layering when adding endpoints (DTO in `schemas`, persistence adapter in `infrastructure`, logic in `use-cases`, route wiring in `api`).
- NestJS templates (hexagonal intent): Keep business logic isolated from transport (controllers). Add env variables via `.env.example` pattern; do not hardcode ports.
- Authentication (Conference Manager API): Firebase integration lives under `providers` and `.env` keys (`AUTH_*`). New auth-related features should extend provider abstractions, not bypass them.

### 3.1 Legacy Hybrid API (ms-conference-api)
The API runs a hybrid stack: an original Express v1 layer plus newer NestJS modules sharing one process via `ExpressAdapter`.

Legacy Express surface:
- Router & controllers under `src/controllers/v1/**` (CommonJS `.js` files like `events.controller.js`, `users/index.js`).
- Express app factory in `src/application.ts` (`getApplication`) wires JSON parsing, `requestvalidation`, mounts `/v1` router.
- Middleware & validation pieces in `src/infrastructure/*` and `src/middlewares/*` used before Nest initialization.

Modern NestJS surface:
- Bootstrapped in `src/main.ts` using `NestFactory.create(AppModule, new ExpressAdapter(expressApp))` to coexist with legacy routes.
- Domain modules/services/entities in `src/modules/**` (e.g., `users/`, `headquarter/`) and DTOs under `modules/.../dto`.
- New REST controllers under `src/interfaces/**` (e.g., `health/health.controller.ts`, `user/user.controller.ts`).
- Shared cross-cutting concerns in `src/common/`, `src/providers/`, and `src/services/` for transitional abstractions.

Migration Guidance:
- Add NEW endpoints as Nest controllers (`src/interfaces/<domain>` + service in `src/modules/<domain>`); avoid expanding Express controllers unless fixing bugs.
- When porting an Express controller: create a Nest controller mirroring path (`/v1/...`) and deprecate the Express file (leave a comment or remove after tests updated).
- Preserve legacy middleware behavior: replicate auth/validation logic via Nest global pipes/guards instead of duplicating Express middleware.
- Do NOT modify `getApplication` unless changing cross-cutting initialization (auth, body parsing). Keep it minimal to avoid Nest startup side-effects.
- Tests: legacy routes currently rely on `yarn test:ci`; new Nest pieces should add spec files under `src/modules/**` or `src/interfaces/**` maintaining existing testing libraries.

Pitfalls:
- Mixing validation: ensure request DTO validation stays in Nest pipes; do not add redundant Express validation for migrated endpoints.
- Environment variables: legacy code may read directly; prefer injecting via Nest `ConfigService` in new code.
- Avoid circular dependencies between `modules/` and legacy `controllers/v1`—treat Express layer as read-only during migration.

Quick identification heuristic: any `.js` file inside `controllers/v1` requiring `express` is legacy; any `.ts` file importing `@nestjs/*` under `interfaces` or `modules` is new.

## 4. Branching, Commits & Conventional Usage
- Branch naming (trunk-based): `user/type/task-name` (example: `jose/feat/add-team-agreements-in-docs`). Agents creating branches should follow this format.
- Commit types allowed: `feat|fix|build|ci|docs|perf|refactor|style|test|chore|revert|wip`. Avoid introducing new types.
- Use root make helpers when available (`make basic-commit`, `make interactive-commit`) to ensure commitlint + husky gates run.
- Do not mutate husky or commitlint config unless explicitly requested; they enforce consistency across heterogeneous tech stacks.

## 5. Testing & Quality Signals
- Use existing test runners per tech: `yarn test:ci` (Conference API); `npm run test:*` (NestJS templates); `make run-tests` (FastAPI template). Add tests into existing `tests/` directory maintaining folder mirroring source domain (e.g., service/use-case pairs).
- Prefer unit tests in templates; integration tests may require container orchestration (`launch-local`). Avoid altering CI YAML placeholders unless enabling actual pipelines.

## 6. Extending Templates vs Product Code
- When enhancing `conference-manager` services, reference templates for structure but modify only product directories (`ms-conference-*`). Do not push product-specific changes back into template archetypes.
- New microservice? Derive from a template by copying its directory; update README & Makefile accordingly. Keep FastAPI layering & NestJS scripts intact.

## 7. Infrastructure & Deployment Notes
- Active deployment pipelines are located in `.github/workflows`. Agents should avoid speculative refactors; only implement concrete requested changes.
- Azure/GitHub Actions YAML files under `devops/` are commented examples. If activating, ensure secret names match placeholders (`AZURE_*`). Containers tagged by commit SHA then retagged `latest`.
- Terraform modules under `cloud/terraform` are environment-agnostic. Agents should avoid speculative refactors; only implement concrete requested changes.

## 8. Common Pitfalls & Guidance
- Database host mismatch errors: check whether running in containers; adjust `DB_HOST` accordingly before assuming code issue.
- Missing Mongo collections: follow README troubleshooting – remove volume and relaunch DB (`make launch-db`). Agents diagnosing should reference this before adding migration logic.
- Keep REST endpoint examples consistent (`/v1/...`). When adding endpoints to API or templates, mirror current versioned path pattern.

## 9. Safe Change Approach for Agents
- Before structural edits: scan corresponding README in target folder for documented commands & structure.
- Follow directory layering; avoid cross-cutting changes (e.g., do not import `webapp` code into `api`).
- Provide minimal, focused patches; leave unrelated TODO blocks in READMEs untouched unless explicitly asked to fill them.

## 10. Quick Reference
- Switch to commit tooling Node: `nvm use v22.15.0` → `make setup-commit-validation`.
- FastAPI new route pattern: schema → use-case → api router include → add test.
- NestJS new feature: create module + service + controller; wire in module; add unit test via `test:unit`.
- Conference API endpoint addition: update `controllers`, optionally `services` + `models`, expose under `/v1` path, add test in `tests`.

If any section lacks clarity (e.g., hexagonal details, missing architecture evolution), request refinement with specific examples you need.

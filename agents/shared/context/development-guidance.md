---
name: development-guidance
description: >
  Team rules for running, developing, and troubleshooting every package in the
  ADE monorepo. Covers the Makefile as Unified CLI Facade, the container-first
  workflow for services, the host-CLI workflow for IaC, and what never to do.
metadata:
  author: app-dev-exp
  version: "1.8"
---

# Development Guidance — ADE Monorepo

## Core Rule: Makefile Is the Unified CLI Facade

Never call the underlying CLI by hand. `cd` into the package, run `make help`,
then only `make <target>`. The Makefile is the Unified CLI Facade — the only
supported entry point. Callers talk to Make; they do not need to know whether
a target wraps Docker or a host CLI.

What the facade wraps depends on the package type.

Decision record: `docs/adr/0001-makefile-unified-cli-facade.md`.

### Where You Build, You Run

Services, websites, and runtime tools are **container-first**.

Applies to: `backend/` (FastAPI, NestJS REST, NestJS GraphQL), Conference
Manager API / webapp / admin, `mobile-app/`, `cli/`, and
`tools/knowledge-mcp/`.

Never run `npm`, `node`, `python`, `pip`, `pipenv`, `uv`, `poetry`, or other
language runtimes on the host. Makefile targets wrap Docker. Development,
testing, linting, and builds happen **inside containers**. That keeps every
developer and every CI/CD run on the same runtime.

### Infrastructure as Code

Do **not** develop IaC inside containers.

Applies to: `cloud/terraform/aws/` (and Azure when a Makefile exists).

Makefile targets wrap the **host** Terraform and AWS CLIs so nobody types
`terraform` or `aws` directly. Host Terraform and AWS CLI are required — see
`cloud/terraform/aws/docs/ADMIN_SETUP.md`.

### Shared

- `make help` is the discovery step for every package — the facade's catalog.
- Forbidden: host `npm` / `node` / `python` in service packages; raw
  `terraform init|plan|apply|destroy` in IaC packages.
- Allowed in IaC: host Terraform **only through the Makefile facade**.

---

## General Workflow Pattern

Every package starts the same way: `cd` into the directory, run `make help`,
then only `make <target>` (the Unified CLI Facade).

Service, website, and runtime-tool packages (container-first) share this
lifecycle:

```
make build-dev          # build the dev image (once, or after Dockerfile change)
make install-dependencies  # install packages into the container volume
make launch / make launch-local / make launch-local-dev  # start the service
make lint               # run linter inside container
make unit-tests         # run tests inside container
make stop / make stop-local / make stop-local-dev              # stop the service
```

When a container-first package breaks, open a shell first — never guess:

```
make interactive        # drops you into /bin/ash or /bin/bash inside the container
```

After completing all changes on a container-first package and before proposing
a commit, the following commands MUST run successfully:

```
make lint
make unit-tests
make build-prod
```

IaC packages do not use `build-dev`, Docker volumes, or `make interactive`.
Use `make init`, `make plan`, and (only with explicit confirmation)
`make apply` / `make destroy`.

---

## Package Reference

### Root Monorepo (`/`)

| Target | Purpose |
|---|---|
| `make create-nodejs-gql` | Scaffold a new NestJS GraphQL microservice |
| `make create-nodejs-rest` | Scaffold a new NestJS REST microservice |
| `make create-py-rest` | Scaffold a new FastAPI microservice |
| `make install-dependencies` | Install root-level Node deps (husky, commitlint) |
| `make init-husky` | Initialise Git hooks (run once after fresh clone) |
| `make setup-commit-validation` | Wire `commit-msg` hook for conventional commits |
| `make lint-commit` | Validate a commit message manually |
| `make devops-all-tests` | Run all GitHub Actions local validation tests |
| `make help` | List all available targets |

---

### Conference Manager — Root (`conference-manager/`)

Orchestrates Conference Manager services together. Project aliases for child packages: `cm-api`, `cm-webapp`, `cm-admin`, `cm-tools` (see `monorepo-paths.md`).

| Target | Purpose |
|---|---|
| `make launch-local-dev` | Start API + Admin + Webapp together for local development |
| `make stop-local-dev` | Stop all local dev services |
| `make build-all` | Build production images for all components |
| `make docker-clean` | Kill all containers, prune stopped containers, remove untagged images |
| `make help` | Show all targets including per-component shortcuts |

---

### Conference Manager API (`cm-api` → `conference-manager/ms-conference-api/`)

NestJS REST API backed by MongoDB and Unleash feature flags.

| Target | Purpose |
|---|---|
| `make build-dev` | Build the dev container image |
| `make build-prod` | Build the optimised production image |
| `make create-volumes` | Create named Docker volume for node_modules — **run once before first use** |
| `make install-dependencies` | Install npm packages into the container volume |
| `make launch-db` | Start MongoDB container |
| `make stop-db` | Stop MongoDB container |
| `make launch-unleash` | Start Unleash feature-flag service |
| `make stop-unleash` | Stop Unleash |
| `make reset-unleash` | Remove Unleash volume (required after Postgres major version upgrade) |
| `make launch-local-dev` | Start the full dev stack: API + DB + Unleash |
| `make stop-local-dev` | Stop the full dev stack |
| `make launch-local-prod` | Start a production-like stack locally |
| `make stop-local-prod` | Stop production-like local stack |
| `make lint` | Run ESLint inside container |
| `make unit-tests` | Run Jest tests inside container |
| `make get-token ROLE=admin` | Retrieve a Firebase auth token for testing (`ROLE=admin` or `ROLE=user`) |
| `make seed-data API_TOKEN=<token>` | Seed headquarters and conference data via the API |
| `make audit-fix-dependencies` | Run `npm audit fix` for critical/high vulnerabilities |
| `make interactive` | Open a shell inside the API container |
| `make docker-clean` | Stop all containers and prune images |
| `make help` | List all targets |

**Troubleshooting tips:**
- If `npm install` errors appear, run `make create-volumes` first (named volume may be missing).
- To inspect data, use `make interactive` and connect via `mongosh` inside the container.

---

### Conference Manager Webapp (`cm-webapp` → `conference-manager/ms-conference-webapp/`)

Next.js 14 App Router frontend. Node dependencies live in a Docker volume — not on the host.

| Target | Purpose |
|---|---|
| `make dev` | Full bootstrap: build image → install deps → launch (use for first run) |
| `make build-dev` | Build the dev container image |
| `make build-prod` | Build the optimised production image (no layer cache) |
| `make install-dependencies` | Install npm packages into the container volume |
| `make launch` | Start the Next.js dev server (interactive, port 8080→3000) |
| `make launch-detached` | Start detached (no TTY — for scripts/agents, port 8080→3000) |
| `make stop` | Stop the running dev container |
| `make lint` | Run ESLint inside container |
| `make unit-tests` | Run Vitest + coverage (80% minimum threshold) |
| `make unit-tests-watch` | Run Vitest in watch mode |
| `make run-storybook` | Start Storybook on port 6006 |
| `make commit` | Interactive conventional commit via `git-cz` inside container |
| `make npm-audit` | Run `npm audit fix --force` inside container |
| `make interactive` | Open `/bin/ash` shell inside the dev container |
| `make docker-clean` | Kill containers, prune stopped, remove untagged images |
| `make help` | List all targets |

**Troubleshooting tips:**
- After a Dockerfile change, always run `make build-dev` before `make launch`.
- If modules are missing at runtime, run `make install-dependencies` — the volume may be stale.
- To debug a Next.js build or runtime error, use `make interactive` and run `npm run build` or `npm run dev` manually inside the shell.

---

### Conference Manager Admin (`cm-admin` → `conference-manager/ms-conference-admin/`)

Django admin panel. Managed via the Conference Manager root Makefile.

| Target (from `conference-manager/`) | Purpose |
|---|---|
| `make build-dev` | Build the dev image for the admin panel |
| `make build-prod` | Build the production admin image |
| `make install-dependencies` | Install Python packages from Pipfile |
| `make launch-local` | Start admin for local development |
| `make stop-local` | Stop local admin service |
| `make interactive` | Open a bash shell in the admin container |

---

### Conference Manager Tools (`cm-tools` → files under `conference-manager/ms-conference-api/`)

Observability and local tooling (Keycloak, Unleash, Prometheus, Grafana) ship with the API package (`docker-compose/` + `tools/`). There is no `conference-manager-tools/` directory. Use git alias `cm-tools` in branches, commits, and PRs when changing those files; `cd` into `conference-manager/ms-conference-api/` to run Makefile targets.

---

### Backend Templates — FastAPI (`FASTAPI_REST`)

FastAPI REST template. Paths: `agents/shared/context/monorepo-paths.md`. Container-first; lockfile is `uv.lock`. `PLATFORM` comes from `.env.public` (default `linux/amd64`). Never run host `python`, `uv`, or `poetry` — `make help` from the template directory, then only Make targets.

| Target | Purpose |
|---|---|
| `make build-dev` | Build the dev container image |
| `make build-prod` | Build the production image |
| `make install-dependencies` | Install packages from `uv.lock` into the container volume |
| `make create-volumes` | Create named container volumes for the database and packages (`.venv`) — **run once before first use** |
| `make launch-local` | Start API + database for local development |
| `make stop-local` | Stop local services |
| `make lint` | Run black, isort, and flake8 inside container |
| `make unit-tests` | Run pytest with coverage inside container |
| `make interactive` | Open a bash shell inside the container |
| `make docker-clean` | Kill all containers and prune images |
| `make help` | List all targets |

---

### Backend Templates — NestJS REST + GraphQL (`NESTJS_REST`, `NESTJS_GQL`)

Container-first NestJS templates. Paths: `agents/shared/context/monorepo-paths.md`. Never run host `npm`, `node`, or `nvm` in these packages — `make help` from the template directory, then only Make targets.

| Target | Purpose |
|---|---|
| `make build-dev` | Build the dev container image |
| `make build-prod` | Build the production image |
| `make create-volumes` | Create named container volumes for node_modules, the app database, and Unleash database — **run once before first use** |
| `make install-dependencies` | Install npm packages into the container volume |
| `make launch-local` | Start API + database for local development |
| `make stop-local` | Stop local services |
| `make lint` | Run ESLint inside container |
| `make unit-tests` | Run Jest tests with coverage inside container |
| `make interactive` | Open a shell inside the container |
| `make docker-clean` | Kill all containers and prune images |
| `make help` | List all targets |

**Troubleshooting tips:**
- If `npm install` errors appear, run `make create-volumes` first (named volume may be missing).
- `make unit-tests` without a prior `make install-dependencies` fails because the named volume is empty.
- `make launch-db` and `make launch-unleash` fail if `…-db-data` / `…-unleash-db-data` were never created — run `make create-volumes`. Postgres 18 cannot reuse old `ms_db` / `unleash_db` volumes.

---

### Knowledge MCP (`KNOWLEDGE_MCP` → `tools/knowledge-mcp/`)

Runtime service (not a bootstrap template) that exposes ADE conventions over MCP. Container-first. Path: `agents/shared/context/monorepo-paths.md`. Never run host `python`, `pip`, `uv`, `poetry`, or `npm` — `make help` from the package directory, then only Make targets.

| Target | Purpose |
|---|---|
| `make build-dev` | Build the dev container image |
| `make build-prod` | Build the production image |
| `make install-dependencies` | Install packages into the container volume |
| `make launch` / `make launch-local` | Start the MCP server (stdio and/or SSE) |
| `make stop` / `make stop-local` | Stop the local server |
| `make lint` | Run the linter inside container |
| `make unit-tests` | Run tests with coverage inside container |
| `make interactive` | Open a shell inside the container |
| `make help` | List all targets |

**Troubleshooting tips:**
- After a Dockerfile change, run `make build-dev` before `make launch`.
- If packages are missing at runtime, run `make install-dependencies`.

---

### CLI (`cli/`)

Internal CLI tool built and packaged inside a container.

| Target | Purpose |
|---|---|
| `make build-dev` | Build the CLI dev image |
| `make build-prod` | Build the CLI production image |
| `make install-dependencies` | Install all CLI dependencies inside the container |
| `make run-unit-tests` | Run unit tests inside container |
| `make build-local-package` | Build the distributable package inside container |
| `make basic-commit` | Run a basic commit workflow inside container |
| `make interactive-commit` | Interactive commit prompt inside container |
| `make cli` | Run the CLI entrypoint |
| `make interactive` | Open a shell inside the container |
| `make help` | List all targets |

---

### Infrastructure — Terraform AWS (`cloud/terraform/aws/`)

AWS infrastructure managed with Terraform. The Makefile is the Unified CLI
Facade over the **host** Terraform CLI — never call `terraform` directly, and
do not develop IaC inside containers. Host Terraform (>= 1.13) and AWS CLI v2
are required; see `cloud/terraform/aws/docs/ADMIN_SETUP.md`.

| Target | Purpose |
|---|---|
| `make init` | Initialise Terraform with the remote backend |
| `make plan` | Generate an execution plan (runs as TF USER) |
| `make apply` | Create or update infrastructure (runs as TF USER) |
| `make destroy` | Destroy all infrastructure in this Terraform state (irreversible) |
| `make help` | List all targets |

**Important:** `make apply` and `make destroy` are irreversible operations that affect shared cloud infrastructure. Always review `make plan` output before applying.

**IAM/OIDC bootstrap layer (separate from the targets above):** `cloud/terraform/aws/makefiles/` holds four additional Makefiles — `aws-backend.mk`, `aws-roles.mk`, `aws-ecr.mk`, `aws-secrets.mk` — that provision the IAM roles, OIDC trust, and backend resources Terraform itself needs to run. These are **manual, admin-only, and never invoked from CI**. Bootstrap run order (see `aws-roles.mk`):

```
bootstrap-boundary → bootstrap-deployer → bootstrap-service-roles → bootstrap-runtime-roles
```

Full detail on how this layer relates to `module/iam` (Terraform-native, the one that actually backs running ECS tasks), the provider-alias broker chain, and the known IAM failure taxonomy lives in
`agents/shared/context/aws-infrastructure-map.md` — read it before diagnosing any IAM/OIDC/permission issue in this package.

---

## Docker Platform

Makefile targets that invoke Docker pass `--platform $(PLATFORM)`. `PLATFORM` is read from the package's `.env.public` (or `.env` if present) — do not hardcode it in the Makefile.

Allowed values: `linux/amd64 | linux/arm64 | linux/x86_64`. Default: `linux/amd64` (CI/cloud parity). Developers may set `PLATFORM=linux/arm64` in a local `.env` on Apple Silicon. Do not use `linux/arm64/v8` or `linux/arm/v7`.

## What Never To Do

| Forbidden | Applies to | Reason |
|---|---|---|
| `npm install` | Services / websites | Installs to host filesystem; diverges from container environment |
| `npm run lint` / `npm test` | Services / websites | Runs with host Node version; may differ from container |
| `node server.js` | Services / websites | Skips the container runtime contract |
| `python manage.py` / `pip install` | Services / websites | Host Python version may conflict; breaks reproducibility |
| `npx` / `bunx` / `pnpm` | Services / websites | Same reason as `npm`; use `make interactive` for a one-off command |
| `terraform init/plan/apply/destroy` | IaC | Must run through the Makefile facade on the host; never call `terraform` directly |

On a container-first package, if you need a command not covered by a Makefile
target, use `make interactive` and run it inside the container.

On an IaC package, add or use a Makefile target. Do not open a Docker shell
and do not run `terraform` on the host outside the Unified CLI Facade.

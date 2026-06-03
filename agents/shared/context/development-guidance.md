---
name: development-guidance
description: >
  Team rules for running, developing, and troubleshooting every package in the
  ADE monorepo. Covers the container-first workflow, Makefile conventions, and
  what to do (and what never to do) in each component.
metadata:
  author: app-dev-exp
  version: "1.1"
---

# Development Guidance — ADE Monorepo

## Core Rule: Where You Build, You Run

> **Never call `npm`, `node`, `python`, `pip`, `pipenv`, `terraform`, or any
> other runtime directly from the host OS.**

Every package ships a `Makefile` whose targets wrap Docker commands. All
development, testing, linting, and builds happen **inside containers**. This
guarantees that every developer (and every CI/CD run) uses the exact same
runtime — no "works on my machine" problems.

Before working on any package:
1. `cd` into the package directory.
2. Run `make help` to see all available targets for that package.
3. Use only `make <target>` to interact with the package.

---

## General Workflow Pattern

Every package follows the same lifecycle:

```
make build-dev          # build the dev image (once, or after Dockerfile change)
make install-dependencies  # install packages into the container volume
make launch / make launch-local / make launch-local-dev  # start the service
make lint               # run linter inside container
make unit-tests         # run tests inside container
make stop / make stop-local / make stop-local-dev              # stop the service
```

When something breaks, open a shell first — never guess:

```
make interactive        # drops you into /bin/ash or /bin/bash inside the container
```

After completing all changes and before propose commit changes, the following command MUST run successfully:

```
make lint
make unit-tests
make build-prod
```

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

Orchestrates all three Conference Manager services together.

| Target | Purpose |
|---|---|
| `make launch-local-dev` | Start API + Admin + Webapp together for local development |
| `make stop-local-dev` | Stop all local dev services |
| `make build-all` | Build production images for all components |
| `make docker-clean` | Kill all containers, prune stopped containers, remove untagged images |
| `make help` | Show all targets including per-component shortcuts |

---

### Conference Manager API (`conference-manager/ms-conference-api/`)

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

### Conference Manager Webapp (`conference-manager/ms-conference-webapp/`)

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

### Conference Manager Admin (`conference-manager/ms-conference-admin/`)

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

### Backend Templates

All templates: FastAPI REST Template (`backend/ms-fastapi-rest-tpl/`), NestJS GraphQL Template (`backend/ms-nestjs-gql-tpl/`), NestJS REST Template (`backend/ms-nestjs-rest-tpl/`) has the following structure:

| Target | Purpose |
|---|---|
| `make build-dev` | Build the dev container image |
| `make build-prod` | Build the production image |
| `make install-dependencies` | Install packages based on the package manager |
| `make create-volume` | Create the database volume (run once before first use) |
| `make launch-local` | Start API + database for local development |
| `make stop-local` | Stop local services |
| `make run-tests` | Run pytest inside container |
| `make interactive` | Open a bash shell inside the container |
| `make docker-clean` | Kill all containers and prune images |
| `make help` | List all targets |

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

AWS infrastructure managed with Terraform. All Terraform commands run inside a container via the Makefile — never call `terraform` directly.

| Target | Purpose |
|---|---|
| `make init` | Initialise Terraform with the remote backend |
| `make plan` | Generate an execution plan (runs as TF USER) |
| `make apply` | Create or update infrastructure (runs as TF USER) |
| `make destroy` | Destroy all infrastructure in this Terraform state (irreversible) |
| `make help` | List all targets |

**Important:** `make apply` and `make destroy` are irreversible operations that affect shared cloud infrastructure. Always review `make plan` output before applying.

---

## Docker Platform

All Makefile targets that invoke Docker pass `--platform linux/amd64`. This is already set in each package's `.env.public` or `.env` file via the `PLATFORM` variable. Do not override it unless explicitly required.

## What Never To Do

| Forbidden | Reason |
|---|---|
| `npm install` | Installs to host filesystem; diverges from container environment |
| `npm run lint` / `npm test` | Runs with host Node version; may differ from container |
| `node server.js` | Skips the container runtime contract |
| `python manage.py` / `pip install` | Host Python version may conflict; breaks reproducibility |
| `terraform init/plan/apply` | Must run inside the container to pick up backend config and correct provider versions |
| `npx` / `bunx` / `pnpm` | Same reason as `npm`; use `make interactive` if you need a one-off command |

If you need to run a command not covered by a Makefile target, use `make interactive` to get a shell inside the running container and execute it there.

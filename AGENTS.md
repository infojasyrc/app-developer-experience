# AGENTS.md

## Overview
- Monorepo for templates (FastAPI, NestJS REST/GraphQL, Mobile) and the "Conference Manager" use case.
- Key folders: `backend/`, `conference-manager/`, `mobile-app/`, `cloud/`, `cli/`, `devops/`, `docs/`.
- Goal: fast, consistent agent contributions with minimal context switching.

## Conventions
- Commits: Conventional Commits (feat, fix, docs, etc.).
- Linting: JS/TS via ESLint+Prettier; Python via Black+Isort+Flake8.
- Secrets: never commit `.env`; use `.env.public` for examples.
- Docs: update component `README.md` when adding/changing features.

## Components
- Backend templates: NestJS REST (`backend/ms-nestjs-rest-tpl/`), NestJS GraphQL (`backend/ms-nestjs-gql-tpl/`), FastAPI (`backend/ms-fastapi-rest-tpl/`).
- Mobile templates: React Native (`mobile-app/whitewalker`), Expo RN (`mobile-app/whitewolf-rn`).
- Conference Manager: API (`conference-manager/ms-conference-api`), Webapp (`conference-manager/ms-conference-webapp`), Admin (`conference-manager/ms-conference-admin`).
- Infra: Terraform modules in `cloud/terraform` (AWS focused).

## Coding Standards
- NestJS: modular architecture; DTOs; standard decorators.
- FastAPI: Pydantic models; strict type hints; PEP8.
- Next.js: App Router in `src/app`; functional components; Tailwind preferred.
- Django Admin: standard MVT; manage via `manage.py`.

## Makefile Workflow
- Common:
  - `make build-dev` – build dev containers.
  - `make install-dependencies` – install deps.
  - `make unit-tests` – run unit tests (component-specific).
- API specifics:
  - `make launch-db` / `make stop-db` – MongoDB.
  - `make launch-unleash` / `make stop-unleash` – Feature flags.
  - `make launch-local-dev` / `make stop-local-dev` – All services.
- Webapp:
  - `make launch` – run in container.
- Root shortcuts:
  - `make` – list commands.
  - `make launch-local-dev` / `make stop-local-dev` – run/stop whole stack.
  - `make webapp-*`, `make api-*` – component command groups.

## Quick Tips for Agents
- Use local `.nvmrc` inside services; root commit tooling needs Node 22.15.0.
- Respect template layering; don't cross-import product code.
- For new features in Conference Manager API, prefer NestJS controllers/services over legacy Express.
- Preserve env dual-mode behavior (containers vs local) when touching `.env` usage.

## When Adding Features
- Backend: create module + service + controller; add tests.
- FastAPI: schema → use-case → API route; add tests.
- Webapp: add components under `src/components`; route under `src/app`.
- Infra: only modify Terraform with explicit requests.

## CI/CD & Docs
- Devops YAML files are examples; activate only with concrete requirements.
- Generate changelogs with root `package.json` scripts after merges.

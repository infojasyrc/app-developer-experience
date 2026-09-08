# Plan: Knowledge MCP Server

Supersedes [docs/plans/20260907-knowledge-mcp-server.md](20260907-knowledge-mcp-server.md). Do not implement from the 20260907 draft.

## Goal

Expose ADE conventions so other repos/agents can query them while building, and later report gaps against a curated reference set — without rewriting target repos.

Conventions include org docs (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*.mdc`), platform templates, **and the required project shape for new work**: every package ships a `Makefile` whose targets wrap Docker (container-first). New projects are expected to offer the shared lifecycle (`build-dev`, `install-dependencies`, `launch`/`launch-local`/`launch-local-dev`, `stop`/`stop-local`, `lint`, `unit-tests`/`run-tests`, `build-prod`, `help`) instead of host `npm`/`python`/`pip`. Source of truth: [agents/shared/context/development-guidance.md](../../agents/shared/context/development-guidance.md).

## Scope

- Affected component(s): new runtime service `tools/knowledge-mcp/` (not a bootstrap template). Docs/rules/CI that register it.
- Files to touch (estimate):
  - New package under `tools/knowledge-mcp/` (FastAPI-slim, MCP layer, ingestion, tests, Makefile, Dockerfile)
  - [agents/shared/context/monorepo-paths.md](../../agents/shared/context/monorepo-paths.md) — alias `KNOWLEDGE_MCP`
  - [CLAUDE.md](../../CLAUDE.md), [.cursor/rules/000-core.mdc](../../.cursor/rules/000-core.mdc)
  - New [.cursor/rules/knowledge-mcp.mdc](../../.cursor/rules/knowledge-mcp.mdc)
  - [agents/shared/context/commit-conventions.md](../../agents/shared/context/commit-conventions.md) — scope `knowledge-mcp`
  - [agents/shared/context/development-guidance.md](../../agents/shared/context/development-guidance.md)
  - CI: new workflow `paths: tools/knowledge-mcp/**` + entry in [.github/actions/get-changed-packages/get-changed-packages.sh](../../.github/actions/get-changed-packages/get-changed-packages.sh)
- Out of scope (explicit):
  - Moving templates under `platform-engineering/` (separate plan, post-MVP, if ever)
  - Auto-fix of consumer repos
  - Publishing the MCP outside the org
  - Placing the MCP under `backend/` as if it were a template
  - Mongo/CRUD from the FastAPI template
  - Duplicating `CLAUDE.md` / rules into a second source of truth
  - Generating or rewriting Makefiles/Dockerfiles in consumer repos (gaps only)

## Closed decisions

| Decision | Choice |
|---|---|
| Directory | `tools/knowledge-mcp/` — runtime service, same category as `conference-manager/` |
| Template grouping | Keep `backend/`, `cli/`, `cloud/`, `devops/`, `mobile-app/` at repo root. Do not nest under `platform-engineering/` before or during this work. |
| Stack | FastAPI, container-first, ≥80% coverage. Scaffold from `backend/ms-fastapi-rest-tpl`, then strip DB/domain CRUD. |
| Path resolution | All template/service paths via aliases in `monorepo-paths.md` (`BACKEND_ROOT`, `NESTJS_REST`, `KNOWLEDGE_MCP`, …). No hardcoded `backend/` vs `platform-engineering/backend/` in MCP logic. |
| Reference dataset | Versioned YAML + manual PRs. Owner = CODEOWNERS of the MCP package. Cadence: quarterly, or a plan doc when a new pattern is adopted. |
| Distribution v1 | Internal only (stdio for Cursor; SSE/HTTP optional in the same process). Publish later. |
| Commit scope | `knowledge-mcp` (do not reuse `cm-tools`, which is Conference Manager observability). |
| New-project shape | Container-first + Makefile is a **first-class convention**, not an optional hint. Ingestion, `get_convention`, `scaffold_guidance`, and `compare_gaps` all cover it. Target *names* may alias (`launch` vs `launch-local`; `unit-tests` vs `run-tests`); the *lifecycle verbs* are required. |

## New-project structure (part of the convention set)

This is in scope for the MCP knowledge corpus and for gap reports. It is **not** auto-applied to consumer repos.

Canonical lifecycle from `development-guidance.md` (“Where You Build, You Run”):

| Verb | Required target (aliases allowed) |
|---|---|
| Build image | `build-dev` |
| Install deps in volume | `install-dependencies` |
| Start | one of `launch`, `launch-local`, `launch-local-dev` |
| Stop | one of `stop`, `stop-local`, `stop-local-dev` |
| Lint in container | `lint` |
| Test in container | one of `unit-tests`, `run-tests` |
| Production image | `build-prod` (required before proposing a commit) |
| Discoverability | `help` |
| Debug shell | `interactive` (recommended) |

Also required for a new package: `Dockerfile` (dev + prod stages as in templates), `.env.public` for `PLATFORM` where Docker is used, and **no** host `npm` / `node` / `python` / `pip` / `poetry` as the developer workflow.

Package-specific extras (`create-volumes`, `launch-db`, …) stay in templates; gap analysis v1 only flags the shared lifecycle above.

## Contract / interface

Public MCP surface (consumers: other org repos' agents/Cursor):

**Resources (read-only)**

- `conventions://tech-stack`
- `conventions://ddd-clean-architecture`
- `conventions://plan-template`
- `conventions://container-first` — Makefile + Docker lifecycle (“Where You Build, You Run”)
- `conventions://component/{name}`

**Tools**

- `get_convention(topic)` — relevant excerpt(s) + `source_path`. Topics include `container-first`, `makefile`, `make-targets`.
- `scaffold_guidance(component_type)` — which platform template to bootstrap from **and** the Make/Docker flow to copy (phase 2)
- `compare_gaps(target_repo_manifest)` — missing/outdated pieces vs curated reference (phase 3), including Makefile presence and required lifecycle targets

**Ingestion record**

```
{ topic, scope_glob, source_path, content }
```

Sources parsed (not copied): `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*.mdc`, `docs/plans/TEMPLATE.md`, [agents/shared/context/development-guidance.md](../../agents/shared/context/development-guidance.md), per-template READMEs and Makefiles (target names only — do not ingest recipes).

Nx target: `nx run knowledge-mcp:sync` (rebuild index; v1 in-memory or JSON under the package `dist/`).

Non-contract: the server does not write files in ADE or in the target repo.

## Architecture

```
ADE knowledge files  -->  ingestion (sync)  -->  records
                                              |
Cursor / other agents  <--  MCP stdio/SSE  --+-- resources
                                              +-- tools
```

Bootstrap from [backend/ms-fastapi-rest-tpl](../../backend/ms-fastapi-rest-tpl) for Makefile/Docker/Poetry conventions only. Keep a healthcheck. Do not keep Mongo or product REST CRUD. MCP transport is the product surface.

## Implementation steps

Implement **one step at a time**. After each step: show the diff, run lint/tests (80% minimum). If a step changes this plan, stop and update this file before continuing.

### Phase 0 — Register the service (docs/CI wiring, no MCP runtime yet)

1. Add alias `KNOWLEDGE_MCP` = `tools/knowledge-mcp/` to `monorepo-paths.md`. Add the same row to `CLAUDE.md` Key Project Locations and `000-core.mdc`.
2. Create `.cursor/rules/knowledge-mcp.mdc` with glob `tools/knowledge-mcp/**`: runtime service (not a template); container-first; Make only; never host `python`/`pip`/`poetry`.
3. Add commit scope `knowledge-mcp` in `commit-conventions.md`.
4. Add a package section to `development-guidance.md` (Make lifecycle).

### Phase 1 — MVP (ingestion + resources + `get_convention`)

5. Scaffold `tools/knowledge-mcp/` from `ms-fastapi-rest-tpl`: Makefile, Dockerfile, `.env.public` (`PLATFORM` from env, not hardcoded), `project.json`, Poetry. Remove DB/CRUD; keep healthcheck.
6. Add MCP layer (Python MCP SDK or FastMCP on FastAPI): handshake, list resources, call tool. Stdio for Cursor; SSE/HTTP optional.
7. Implement ingestion parser. Prefer `.mdc` frontmatter + `CLAUDE.md` headings over naive full-file dumps. Must ingest `development-guidance.md` (container-first / Make lifecycle). Wire `knowledge-mcp:sync`.
8. Expose the resource families listed in Contract, including `conventions://container-first`.
9. Implement `get_convention(topic)` (excerpts + `source_path`). `topic=container-first` / `makefile` / `make-targets` must return the shared lifecycle and the “never call runtimes on the host” rule.
10. Unit tests for parser and tool; integration test that the server lists resources and returns a real excerpt from `CLAUDE.md`, a rule, **and** `development-guidance.md` for `container-first`. Coverage ≥80%.
11. Make targets: `build-dev`, `install-dependencies`, `lint`, `unit-tests`, `build-prod`. Document in package README.
12. CI: PR workflow `paths: tools/knowledge-mcp/**`; register `tools/knowledge-mcp/|knowledge-mcp|knowledge MCP server` in `get-changed-packages.sh`.

**Phase 1 exit:** another checkout can configure the MCP and retrieve a live excerpt from ADE knowledge files.

### Phase 2 — `scaffold_guidance`

13. Curated YAML: `component_type` → path alias (`NESTJS_REST`, `MS_FASTAPI`, `CI_AWS_BACKEND`, …) + how (`cd`, `make help`, container-first Make lifecycle, no host npm/python). Values from `monorepo-paths.md` + `development-guidance.md`.
14. Tool `scaffold_guidance(component_type)` returns: which template to copy, that the new package **must** keep a Makefile + Dockerfile, and the expected target set (with allowed aliases). Do not duplicate root Makefile copy logic.
15. Tests: known types; unknown type returns a clear error. `conference-manager` is not a template. Assert the response includes the Makefile lifecycle, not only a folder path.

### Phase 3 — `compare_gaps`

16. Add `tools/knowledge-mcp/data/reference.yaml` + `CODEOWNERS` + cadence note. Include `build-tooling` and `containerization` as **required** for new projects:
    ```
    build-tooling:
      required: makefile
      targets:
        required: [build-dev, install-dependencies, lint, help]
        required_one_of:
          launch: [launch, launch-local, launch-local-dev]
          stop: [stop, stop-local, stop-local-dev]
          test: [unit-tests, run-tests]
        recommended: [build-prod, interactive]
    containerization:
      required: [dockerfile]
      rule: make-targets-wrap-docker
    ```
17. Tool `compare_gaps(target_repo_manifest)`: input = detected files/tools **and Makefile target names**; output = missing/outdated. v1: conventional commits + Makefile + core lifecycle targets + Dockerfile. Then IaC. A repo with a Makefile that only wraps host `npm`/`python` is a gap (violates “Where You Build, You Run”).
18. Fixture against `conference-manager/`: Django vs FastAPI/NestJS mismatch is a **documented exception**, not a false-positive gap (`000-core.mdc` / `conference-manager.mdc`).
19. Tests: “complete” repo (Makefile + Dockerfile + core targets) vs missing Makefile vs Makefile without `build-dev`/`install-dependencies`; CM fixture.

### Phase 4 — Feedback loop (process only)

20. Document in the package README: real gaps → human PR to `CLAUDE.md` / `AGENTS.md` / rules. No automatic writes.

### Phase 5 — Pull request (after Phase 4)

21. Open **one** pull request that includes Phases 0–4 (this work is a single feature, not one PR per phase). Use [.github/pull_request_template.md](../../.github/pull_request_template.md) and fill every section:
    - Project or Area: check MonoRepo / App Developer Experience (ade) and Knowledge MCP (`knowledge-mcp`)
    - Issue ticket: leave blank or link if one exists
    - Checklist: self-review and tests
    - Type: Feature (and Documentation / Unit testing if those apply)
    - Current module / new behavior / breaking change: No
    - Screenshots: omit unless there is a visual
22. Do **not** mention any GenAI tool (Cursor, Claude Code, or similar) in the title, body, or commit messages.

## Risks

- Markdown ingestion is brittle — start with `.mdc` frontmatter and `CLAUDE.md` headings.
- FastAPI template brings Mongo; leaving it in would make this a fake CRUD service. Strip it in step 5.
- Commit scope collision with `cm-tools` if someone names the MCP scope `tools`.
- Path tests break if templates are moved mid-flight; this plan forbids that move. MCP logic must use aliases.

## Acceptance criteria

- [ ] Package exists at `tools/knowledge-mcp/` and is tagged as a runtime service in `.cursor/rules/knowledge-mcp.mdc`
- [ ] `KNOWLEDGE_MCP` is the only path agents/MCP code should hardcode (via `monorepo-paths.md`)
- [ ] `get_convention` returns excerpts with `source_path` from real ADE files
- [ ] `get_convention("container-first")` (or `makefile` / `make-targets`) returns the Make/Docker lifecycle from `development-guidance.md`
- [ ] Resource `conventions://container-first` is available
- [ ] MCP resources listed in Contract are available
- [ ] Phase 3: `compare_gaps` flags missing Makefile, missing Dockerfile, missing core lifecycle targets, and host-runtime-only Makefiles
- [ ] Coverage ≥80%; `make lint`, `make unit-tests`, `make build-prod` pass inside Docker
- [ ] PR CI runs only when `tools/knowledge-mcp/**` changes
- [ ] Phase 2: `scaffold_guidance` points at template aliases, not copied scaffolding
- [ ] Phase 3: `compare_gaps` treats Conference Manager stack mismatch as a documented exception
- [ ] Templates remain at current root paths (`backend/`, `cli/`, `cloud/`, `devops/`, `mobile-app/`)
- [ ] Server never writes consumer or ADE knowledge files
- [ ] Phase 5: one PR for Phases 0–4, body filled from `.github/pull_request_template.md`, no GenAI-tool attribution

## Impacted consumers

- **This monorepo:** agents and Cursor (new rule + path alias). No change to existing template copy-paste flows.
- **Other org repos (v1, internal):** optional MCP client config pointing at this server. No required migration.
- **Not impacted:** `backend/`, `cli/`, `cloud/`, `devops/`, `mobile-app/` layouts; `conference-manager/` runtime behavior.

## Deferred (own plan later, if desired)

Group templates under `platform-engineering/{backend,cli,cloud,devops,mobile-app}/` **after** MCP MVP. That refactor has its own blast radius (Nx layout, CI path filters, workspace folders, Cursor globs, Makefile copy paths). If done, update only `monorepo-paths.md` + `CLAUDE.md`; MCP keeps working via aliases.

Do **not** put the MCP inside `platform-engineering/` — that would mix bootstrap templates with a runtime service.

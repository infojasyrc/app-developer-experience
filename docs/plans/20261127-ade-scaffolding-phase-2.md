# Plan: ADE scaffolding platform — Phase 2 (core + `appdevexp new`)

## Goal
Implement Phase 2 of the migration roadmap in
[`docs/analysis/ade-scaffolding-and-knowledge-platform.md` §8](../analysis/ade-scaffolding-and-knowledge-platform.md#8-migration-roadmap):
- extract the knowledge domain from `tools/knowledge-mcp` into `tools/ade-core`;
- add `appdevexp new` with plan/apply and `--dry-run`;
- publish `artifacts-index.json`;
- document how child projects start using it.

Exit criterion: `appdevexp new` creates a project that passes
`make unit-tests`, using a template from a GitHub release.

## Scope
- Affected component(s):
  - `tools/ade-core`: becomes an installable package, gains the knowledge domain, sources, plan/apply and the index builder;
  - `tools/knowledge-mcp`: now an adapter;
  - `cli`: `new service`, `list`;
  - `.github` (release + PR workflows);
  - docs.
- Files to touch (estimate):
  - `tools/ade-core/**`
  - `tools/knowledge-mcp/{pyproject.toml,uv.lock,Dockerfile,Makefile,.dockerignore,README.md,src/**,tests/**}`
  - `cli/{pyproject.toml,uv.lock,Dockerfile,Makefile,README.md,src/**,tests/**}`
  - `.github/workflows/{release.yml,pull_request_cli.yml,pull_request_knowledge_mcp.yml,pull_request_knowledge_governance.yml}`
  - `docs/AdoptingADE.md` (new), `docs/standards/release-strategy.md`, `docs/KnowledgeMCP.md`, the analysis doc, `agents/shared/context/monorepo-paths.md`, `CLAUDE.md`
- Out of scope (explicit):
  - **Dependency pruning for disabled features:** deferred to Phase 5. It needs lockfile regeneration, and the engine never runs installs.
  - **Released CLI binaries and a GHCR image:** Phase 7. Child projects build the CLI image from an ADE clone.
  - **Build-provenance attestation for bundles.**
  - `appdevexp mcp`, `sync pull`, `update`, `doctor` (Phases 3–5).

## Contract / interface
- **`ade-core` is a uv path dependency** of `cli/` (`../tools/ade-core`) and `tools/knowledge-mcp/` (`../ade-core`):
  - development: the Makefiles bind-mount it;
  - images: the Makefiles pass it as the named build context `ade-core` (`docker build --build-context`).
- **knowledge-mcp:** its MCP tools and resources are unchanged. `ade_core.knowledge` now owns ingestion, the catalog, `scaffold_guidance`, `compare_gaps` and `data/*.yaml`.
- **`artifacts-index.json` (`index_schema: 1`):**
  - published on the rolling `index` release;
  - one entry per artifact: `kind`, `tag_prefix`, `latest`, `versions{url, sha256, manifest_schema, min_engine_version}`.
- **`.ade/answers.yaml` (`ade_receipt: 1`):** `engine_version`, `cli_version`, `artifacts[{artifact, version, source, output_dir, parameters, features, generated_at}]`.
- **`appdevexp new service`:**
  - `--template NAME[@SPEC]`, `--name`, `--feature k=v`, `--param k=v`, `--output-dir`, `--target`, `--answers`;
  - `--source github|path:DIR`, `--registry`, `--index-url`, `--refresh`;
  - `--dry-run`, `--yes`, `--format text|json`.
  - Precedence: flags > answers > detected > defaults.
- **`appdevexp list`.**

## Implementation steps
1. Branch `ade/jose/feat/scaffolding-phase-2-core-new`.
2. **Move the knowledge domain** with `git mv` into `ade_core.knowledge`, data files included. Make `ade-core` a hatchling package (v0.2.0).
3. **Add the core modules:**
   - versions and index;
   - receipt;
   - `ArtifactSource` port with GitHub and local adapters;
   - `ProjectInspector`;
   - `plan_scaffold` / `apply_scaffold`;
   - the index builder and the `index` command;
   - the `make build-index` target.
4. **Rewire knowledge-mcp** to `ade_core.knowledge`: build context, mount, and tests split between the two packages.
5. **CLI:**
   - Python 3.13;
   - `ade-core` dependency;
   - `new service` / `list`;
   - PyInstaller data flags;
   - `make scaffold` / `make list-artifacts`;
   - tests against a `file://` index.
6. **`release.yml` `publish-artifacts-index` job.** CI triggers: an `ade-core` change re-tests the CLI and knowledge-mcp; the governance paths follow the move.
7. **Docs:** the child-project guide (`docs/AdoptingADE.md`), the release runbook, analysis status notes, the paths file.
8. **PR** from `.github/pull_request_template.md`.

## Pull request
- Branch: `ade/jose/feat/scaffolding-phase-2-core-new`
- The body uses `.github/pull_request_template.md`.
  - Areas: ade, knowledge-mcp, ade-core.
  - Types: Feature, Unit testing, configuration, development scripts, Documentation.
  - Breaking change: No.

## Risks
- **`--build-context` needs BuildKit** (Docker 23+ / buildx, Podman 4.x).
  - The GitHub runners and Docker Desktop support it.
- **No `index` release until the first publish.**
  - `appdevexp` fails with a clear message.
  - Mitigation: after merge, run `gh workflow run release.yml -f packages="index"`.
- **The index cache lasts 24h,** so a fresh release may be invisible for up to a day.
  - Mitigation: `--refresh`.
- **The CLI moves from Python 3.12 to 3.13** (container only).

## Acceptance criteria
- [x] `tools/ade-core`: `make lint unit-tests validate-manifests` (165 tests, 98.8% coverage).
- [x] `tools/knowledge-mcp`: `make lint unit-tests sync build-prod` (85.6% coverage).
- [x] `cli`: `make run-unit-tests build-prod`; `appdevexp --version` prints the engine version.
- [x] `make build-index` over the real releases produces correct sha256 values for `fastapi-rest@0.2.0`, `nestjs-gql@0.0.1` and `nestjs-rest@0.3.0`.
- [x] `appdevexp new service` from the real `nestjs-rest-tpl-v0.3.0` bundle (standalone, `feature_flags=none`): the generated project passes `make create-volumes build-dev install-dependencies unit-tests`.
- [x] `fastapi-rest-tpl-v0.2.0` (monorepo layout, `database=none auth=none`): `make unit-tests` passes.
- [ ] After merge: `index` release published; `appdevexp list` works without `--index-url`.

## Impacted consumers
- **knowledge-mcp maintainers:** knowledge code and data now live in `tools/ade-core/src/ade_core/knowledge/`.
- **CLI users:** the image now needs `--build-context ade-core=…`; use the Make targets.
- **Child projects:** a new adoption path (`docs/AdoptingADE.md`) and a new `.ade/answers.yaml` file.

# Plan: ADE scaffolding platform — Phase 1 template manifests

## Goal
Implement Phase 1 of the migration roadmap in
[`docs/analysis/ade-scaffolding-and-knowledge-platform.md` §8](../analysis/ade-scaffolding-and-knowledge-platform.md#8-migration-roadmap):
- add a `template.yaml` manifest to every backend template;
- add a CI job that renders every feature combination and runs the template's
  own Make targets (`build-dev`, `install-dependencies`, `lint`, `unit-tests`,
  `build-prod`) on each result.

Exit criterion: manifest CI is green on `main`.

## Scope
- Affected component(s):
  - `tools/ade-core` (new package: manifest model and render engine);
  - `backend/` (three manifests);
  - `.github` (PR workflow, changed-package detection);
  - agent conventions (paths, commit scope, Cursor rule, PR template);
  - the analysis document.
- Files to touch (estimate):
  - `tools/ade-core/**` (new)
  - `backend/{fastapi-rest-tpl,nestjs-rest-tpl,nestjs-gql-tpl}/template.yaml` (new), plus one line in each README
  - `.github/workflows/pull_request_backend.yml`, `.github/actions/get-changed-packages/get-changed-packages.sh`
  - `agents/shared/context/monorepo-paths.md`, `agents/shared/context/commit-conventions.md`, `CLAUDE.md`, `.cursor/rules/000-core.mdc`, `.cursor/rules/ade-core.mdc` (new), `.github/pull_request_template.md`
  - `docs/analysis/ade-scaffolding-and-knowledge-platform.md`
- Out of scope (explicit):
  - `appdevexp new`, plan/apply, the `ProjectInspector`, `.ade/answers.yaml` (Phase 2+);
  - pruning dependencies or regenerating lockfiles when a feature is off (Phase 2);
  - releasing `ade-core` (Phase 7).

## Contract / interface
- **`template.yaml` (`manifest_schema: 1`):**
  - `identity` (token + files);
  - `exclude`;
  - `parameters` (JSON Schema, inlined per manifest so a template bundle is self-contained);
  - `features` (`values`, `default`, `when.<value>` transforms);
  - `edits` (`dotenv_set`, `json_set`);
  - `next_steps`.
- **Transform ops:** `remove_files`, `remove_env`, `remove_make_targets`, `remove_lines` (regex), `replace` (literal). Every op must match at least once. Otherwise the render fails with `StaleManifestError`, which is how CI catches a manifest that drifted from its template.
- **Feature values per template:**
  - NestJS REST / GQL: `feature_flags` (`unleash` | `none`) × `database` (`postgres` | `none`);
  - FastAPI: `database` (`postgres` | `none`) × `auth` (`jwt` | `none`).
- **What a disabled feature removes:** only the feature's wiring (files, env vars, compose services, Make targets, config/code references).
  - Dependencies and lockfiles are kept, because `npm ci` and `uv sync --frozen` need them in sync.
- **Lockfiles:** `package-lock.json` / `uv.lock` are kept and renamed through the identity token. They are not excluded, because the NestJS Dockerfiles run `npm ci`.
- **`tools/ade-core` CLI** (`python -m ade_core`, used through Make):
  - `validate`: render every combination;
  - `combinations`: GitHub matrix JSON;
  - `render`: one combination into an output dir.

## Implementation steps
1. Branch `ade/jose/feat/scaffolding-phase-1-manifests`. Add this plan.
2. Create `tools/ade-core`, mirroring `tools/knowledge-mcp` packaging:
   - container-first (`Dockerfile`, `Makefile`, `.env.public`);
   - engine and transforms;
   - unit tests and repo tests, coverage ≥ 80%.
3. Write the three manifests. `make validate-manifests` renders all 12 combinations.
4. CI:
   - `ade-core-unit-tests` job;
   - a `manifest-combinations` job (dynamic matrix filtered by changed packages);
   - a `render-and-verify` matrix job.
   - Both verify jobs join `pr-gate-templates`, so no ruleset change is needed.
   - Add `workflow_dispatch` for a full run on `main`.
5. Register `ade-core` in agent conventions and the PR template. Update analysis §4.1, §4.3 and §8.
6. Open a PR from `.github/pull_request_template.md`.

## Pull request
- Branch: `ade/jose/feat/scaffolding-phase-1-manifests`
- The body uses `.github/pull_request_template.md`.
  - Areas: ade, ade-core, the three backend templates.
  - Breaking change: No.

## Risks
- **CI time.** 12 render legs build and test full projects.
  - Mitigation: the matrix is filtered to the changed templates (all templates only when `ade-core` changes), with `max-parallel: 6` and `fail-fast: false`.
- **Template edits break a manifest** (for example, a renamed file).
  - This is intended: the render fails with the stale manifest entry named, and the PR must update `template.yaml` in the same change.
- **Merge triggers releases.**
  - The squash commit `feat(ade): …` touches all three templates, so the merge minor-bumps and releases them. Their bundles then include `template.yaml`.
  - Rollback: revert the PR, then `gh release delete <tag> --cleanup-tag --yes`.
- **Rendered output ownership on Linux runners.** `make render` runs the container with the caller's uid/gid.

## Acceptance criteria
- [ ] `make lint`, `make unit-tests` (≥ 80%) and `make validate-manifests` pass in `tools/ade-core`.
- [ ] Every combination renders. The rendered NestJS project with `feature_flags=none database=none` and the FastAPI project with `database=none auth=none` pass `make build-dev install-dependencies lint unit-tests` locally.
- [ ] `pr-gate-templates` is green on the PR, including every `render-and-verify` leg.
- [ ] After merge, a `workflow_dispatch` run of `pull_request_backend.yml` on `main` is green.

## Impacted consumers
- Template maintainers: a change that moves or renames a file referenced by `template.yaml` must update the manifest in the same PR.
- Template release bundles: they now include `template.yaml`.
- Contributors and agents: there is a new commit scope, `ade-core`, and a new PR template checkbox.

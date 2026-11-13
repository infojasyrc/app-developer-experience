# Plan: ADE scaffolding platform — Phase 0 cleanup

## Goal
Implement Phase 0 of the migration roadmap in
[`docs/analysis/ade-scaffolding-and-knowledge-platform.md` §8](../analysis/ade-scaffolding-and-knowledge-platform.md#8-migration-roadmap):
remove the legacy root `create-*` scaffolding, fix catalog path drift, and
publish every backend template as a versioned GitHub release with notes that
match the release version.

Exit criteria (from the analysis): every template has a current GitHub
release; `scaffold_guidance` returns real paths.

## Scope
- Affected component(s): root `Makefile` (ade), `tools/knowledge-mcp`, `agents/shared/context`, `.github` (release pipeline), `backend/nestjs-rest-tpl` (changelog header only), docs.
- Files to touch (estimate):
  - `Makefile`, `README.md`, `package.json`
  - `tools/knowledge-mcp/data/scaffold.yaml`, `tools/knowledge-mcp/tests/test_scaffold_guidance.py`
  - `agents/shared/context/monorepo-paths.md`, `agents/shared/context/development-guidance.md`
  - `.github/actions/generate-release-changelog/action.yml`, `.github/workflows/release.yml`
  - `docs/standards/release-strategy.md`, `docs/standards/README.md`
  - `backend/nestjs-rest-tpl/CHANGELOG.md`
  - `docs/analysis/` (added to the repo with this PR)
- Out of scope (explicit): `template.yaml` manifests (Phase 1), `tools/ade-core` and `appdevexp new` (Phase 2), artifacts index, reusable workflows (Phase 4).

## Contract / interface
- **Root Makefile:** `create-nodejs-gql`, `create-nodejs-rest`, `create-py-rest` and `clean-examples` are removed. This is a breaking change for anyone calling them. The supported flow is to copy `backend/<tpl>` (or follow the Knowledge MCP `scaffold_guidance`), then use the template's own Make targets.
- **Knowledge MCP `scaffold_guidance`:** `mobile-expo` now returns `mobile-app/caraxes/` and accepts the alias `caraxes` (`whitewolf-rn` is dropped). `ci-aws-backend` / `ci-aws-webapp` return the real `.yml` files.
- **Release pipeline:** template releases are tag-only. Nothing is pushed to `main` (the `main` ruleset requires a PR and has no bypass actors). Each release gets:
  - tag `<tpl>-vX.Y.Z`;
  - notes for that version only;
  - assets `<tag>.tar.gz`, `<tag>.zip` and `<tag>.tar.gz.sha256`, built from tracked files only, with the version stamped into the bundle.
- **`generate-release-changelog` action:** the `npm-script` input is removed. It gains the outputs `tag` and `released`.

## Implementation steps
1. Branch `ade/jose/chore/scaffolding-phase-0-cleanup`. Add this plan and `docs/analysis/`.
2. Fix the paths in `scaffold.yaml` and `monorepo-paths.md`, and the README tree. Add a test that every catalog path exists.
3. Rewrite the release action as tag-only. Add release jobs for `fastapi-rest-tpl` and `nestjs-gql-tpl`, and a `workflow_dispatch` `packages` input. Document the release runbook.
4. Remove the root `create-*` targets and their doc references.
5. Run `make lint` and `make unit-tests` in `tools/knowledge-mcp`, then open a PR from `.github/pull_request_template.md`.

## Pull request
- Branch: `ade/jose/chore/scaffolding-phase-0-cleanup`
- The body uses `.github/pull_request_template.md`. Areas: ade, knowledge-mcp, the three backend templates, caraxes (path only). Breaking change: **Yes** (root `create-*` removed).

## Risks
- **First tag-only run fails** (wrong token permission, or a parse error in a bump tool).
  - Impact: limited to the release job. No code or `main` history changes, because nothing is pushed to `main`.
  - Rollback: revert this PR. Delete any partial release with `gh release delete <tag> --cleanup-tag --yes`.
  - Who sees it: the failed run notifies the person who merged or dispatched the workflow.
- **`BREAKING CHANGE` keyword in the squash commit.** The merge commit touches `backend/nestjs-rest-tpl/`, so this keyword would major-bump that template. The break is therefore described in prose and in the PR template, never with the keyword.
- **In-repo `package.json` / `pyproject.toml` versions no longer move.** Tags are the source of truth, and this is documented in `docs/standards/release-strategy.md`.

## Acceptance criteria
- [ ] `make unit-tests` in `tools/knowledge-mcp` passes, including a test that every `scaffold.yaml` component path exists.
- [ ] Root `make help` lists no `create-*` / `clean-examples`.
- [ ] After merge and a `workflow_dispatch` (`packages="tpl-fastapi-rest tpl-nestjs-gql"`), `gh release list` shows a current release for all three templates, each titled with the same version as its notes header.

## Impacted consumers
- Anyone running the root `make create-*` (local developer workflow only; no CI uses these targets).
- Knowledge MCP clients calling `scaffold_guidance("mobile-expo" | "whitewolf-rn" | "ci-aws-*")`.
- Consumers of template release assets: the layout is unchanged (template contents at the archive root). A new `.sha256` asset is added.

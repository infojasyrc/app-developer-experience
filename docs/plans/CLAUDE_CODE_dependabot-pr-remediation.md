# Plan: Dependabot PR remediation (grouped by component)

Snapshot: 2026-10-05, 28 open Dependabot PRs plus 1 human PR (#120, out of scope).

## Goal
Get every open Dependabot PR to green and merged (or deliberately closed), starting with the one
shared cause that fails most of them, then working through each component's real breaking changes.

## Scope
- Affected component(s): backend (`nestjs-rest-tpl`, `nestjs-gql-tpl`, `fastapi-rest-tpl`), conference-manager (`cm-api`, `cm-webapp`), CI (`.github/`)
- Files to touch (estimate): `.github/workflows/validate_commits.yml`, root `commitlint.config.js`, `.github/dependabot.yml`, each component's `package.json` / lockfile / `pyproject.toml`, `Dockerfile`s
- Out of scope (explicit): PR #120 (human-authored CLI poetry move); changes to cloud/terraform; no force-merging with red checks

## Status tracker

| Phase | Component | PRs covered | Status | Branch / PR |
|---|---|---|---|---|
| 0 | CI (commitlint + Node LTS policy) | all Dependabot PRs, #251, #252 | Implemented (PR open) | `ci/dependabot-commitlint-node-lts` (PR_LINK) |
| 1 | nestjs-rest-tpl | 257, 239, 258, 259, 260 | Not started | |
| 2 | nestjs-gql-tpl | 261, 232, 233, 234, 236 | Not started | |
| 3 | fastapi-rest-tpl | 218, 224, 225, 226, 227, 213 | Not started | |
| 4 | cm-api | 262, 231, 237, 238, 241, 251 | Not started | |
| 5 | cm-webapp | 230, 244, 245, 246, 247, 252 | Not started | |

Status values: Not started, In progress, Implemented (PR open), Merged.

## Findings

### Shared failure: "Validate commit messages" (17 of 28 PRs)
Dependabot commit bodies include long changelog/release-note lines. `@commitlint/config-conventional`
enforces `body-max-line-length` (100), which fails with `body's lines must not be longer than 100
characters`. This is a config problem, not a dependency problem. It is independent of the component,
and it masks real results because the PR gate stays red.

Affected: 262, 261, 257, 244, 239, 232, 231, 230, 247, 218 (and the same check on the rest of the npm/uv group PRs).

### Real failures
| PR | Component | Cause |
|---|---|---|
| 260 | nestjs-rest-tpl | `npm ci` ERESOLVE: `@nestjs/axios@12` conflicts with `@nestjs/terminus@11.1.1` peer (`axios ^2 \|\| ^3 \|\| ^4`) |
| 251/252 | cm-api, cm-webapp | Dependabot proposes `node:25-alpine`, a non-LTS release. Policy: Docker Node images use the LTS line, so the target is `node:24-alpine`. The old failure on #252 (`ThemeContext.spec.tsx`, 14 tests, run of 2026-09-24) must be re-verified on Node 24 |
| 258/259/260 | nestjs-rest-tpl | NestJS 12 major set: `core`, `config`, `axios` must move together |

## Implementation steps

### Phase 0: Unblock CI (one PR, do first)
Branch `fix/ci-commitlint-ignore-dependabot`.
1. In root `commitlint.config.js`, add an `ignores` rule that skips commits whose body contains
   `Signed-off-by: dependabot[bot]` (or `rules: { 'body-max-line-length': [0] }` if the team prefers).
   Keep the rule for human commits.
2. Check `cm-api` and `nestjs-rest-tpl` `commitlint.config.*` for the same rule.
3. Align `validate_commits.yml` to read the repo config rather than relying on the ad-hoc install.
4. Update `.github/dependabot.yml`: in every `docker` entry that tracks a Node base image
   (`/conference-manager/ms-conference-webapp`, `/conference-manager/ms-conference-api`,
   `/backend/nestjs-rest-tpl`, `/backend/nestjs-gql-tpl`) add:
   ```yaml
   ignore:
     - dependency-name: "node"
       versions: [">= 25"]   # Node policy: LTS only (target: 24). Revisit when the next LTS is adopted.
   ```
   Also record the policy (Node images = LTS only, currently 24) in `docs/standards/`.
5. Ask Dependabot to rebase the affected PRs (`@dependabot rebase`) so the check re-runs.

### Phase 1: backend / `nestjs-rest-tpl` (PRs 257, 239, 258, 259, 260)
1. Merge patch/minor first: #257 (unleash-client), #239 (dev group, 11 updates).
2. NestJS 12 majors as ONE combined branch, since #258/#259/#260 depend on each other: `@nestjs/core`
   12, `@nestjs/config` 12, `@nestjs/axios` 12, plus align `@nestjs/common`, `platform-express`,
   `testing`, `cli`, `schematics`, `swagger`, `terminus`, and `typeorm` to versions that declare NestJS 12 support.
3. If `@nestjs/terminus` has no release with a NestJS 12 / axios 12 peer range, hold `axios` at 4.x and close #260 with a comment; revisit when terminus publishes.
4. Run `make install-dependencies lint unit-tests build-prod` from `backend/nestjs-rest-tpl`.
5. Close #258/#259/#260 in favour of the combined PR (or let Dependabot rebase them onto it).

### Phase 2: backend / `nestjs-gql-tpl` (PRs 261, 232, 233, 234, 236)
1. Merge groups first: #261 (prod minor/patch), #232 (dev minor/patch).
2. #234 `@types/multer` 2.x: check it matches the installed `multer` major, then merge.
3. #233 `graphql` 17: check `@nestjs/graphql` / `@apollo/*` peer ranges. Hold if unsupported.
4. #236 `typescript` 7: hold until `typescript-eslint`, `ts-jest`, `@nestjs/cli` support it. Ignore the major in
   `dependabot.yml` for `typescript` until then.
5. Run `make lint unit-tests build-prod` from `backend/nestjs-gql-tpl`.

### Phase 3: backend / `fastapi-rest-tpl` (PRs 218, 224, 225, 226, 227, 213)
1. Merge the low-risk ones individually: #225 `async-lru`, #226 `pytest-cov`, #218 `apscheduler` 3.11.
2. #227 `sqlalchemy` 2.0.25 -> 2.0.52 (patch-level in 2.0): run integration tests against the DB.
3. #224 `gunicorn` 26 (3 majors): check the worker/config flags in the entrypoint.
4. #213 `python` 3.14-alpine: check that wheels exist for all pinned deps (asyncpg etc.) before merging.
5. Run `make lint unit-tests build-prod` from `backend/fastapi-rest-tpl`. The uv lockfile must be regenerated, not hand-edited.

### Phase 4: conference-manager / `cm-api` (PRs 262, 231, 237, 238, 241, 251)
1. Merge groups: #231 (prod), #262 (dev).
2. Mongoose 9 (#241) and `@nestjs/mongoose` 12 (#237) go together: one branch. `@nestjs/passport` 12 (#238) with the NestJS core version it requires.
3. Check that `@nestjs/mongoose` 12 requires NestJS 12; if so, the NestJS core upgrade for cm-api must come first (same approach as Phase 1).
4. #251 `node:25-alpine` is not LTS. Do not merge it. Retarget the Dockerfile to `node:24-alpine` in a manual PR (`chore(cm-api): move node image to 24 LTS`), then close #251. The Phase 0 ignore rule stops it coming back.
5. Run the cm-api Make targets (`lint`, `unit-tests`, `build-prod`).

### Phase 5: conference-manager / `cm-webapp` (PRs 230, 244, 245, 246, 247, 252)
1. Merge groups: #230 (prod), #244 (dev, 15 updates).
2. #245 `@vitest/browser` 5 must match the `vitest` major, so upgrade `vitest` and related packages in the same PR.
3. #246 `@commitlint/config-conventional` 21: low risk once Phase 0 is done.
4. #247 `eslint-plugin-storybook` 10.6: needs the Storybook 10 packages; upgrade them together or hold.
5. #252 `node:25-alpine`: same as #251. Move the Dockerfile to `node:24-alpine`, close #252, then run `make lint unit-tests`. If `ThemeContext.spec.tsx` (14 tests) still fails on Node 24, fix it in that PR (suspect jsdom/localStorage setup); if it passes, the earlier failure was Node 25-specific.

## Order of work
Phase 0 -> (Phases 1-5 in parallel, one engineer or agent per component) -> final sweep: `gh pr list --state open --author app/dependabot` should be empty or only deliberate holds.

## Pull request
Each phase is its own branch/PR named `chore/deps-<alias>-<topic>`; branch -> PR, never push to `main`.
Every PR body must be built from `.github/pull_request_template.md` (all headings kept, applicable boxes
ticked, sections filled) and must not include AI-tool attribution. Commit messages: conventional commits, scope = component (e.g. `chore(nestjs-rest-tpl): ...`).

## Risks
- NestJS 12 and Mongoose 9 are major upgrades. Subtle runtime changes may pass lint/unit tests. Run the app (`launch-local`) before merging.
- Closing Dependabot PRs without an `ignore` entry leads to re-opening. Add ignores deliberately. The `>= 25` Node ignore must be revisited when the team adopts the next LTS, or Dependabot will never propose it.
- Moving from Node 20 to 24 skips a major LTS. Run the full Make flow and `launch-local` for both conference-manager images.
- Weakening commitlint for everyone would hide real violations. Scope the exception to Dependabot only.
- Dependabot PRs with `UNKNOWN` mergeable state may be stale. Rebase before judging them.

## Acceptance criteria
- [ ] All Node Dockerfiles use `node:24-alpine`; `dependabot.yml` ignores Node >= 25
- [ ] "Validate commit messages" passes on Dependabot PRs
- [ ] Each component's `lint`, `unit-tests` and `build-prod` pass on `main` after the merges
- [ ] No open Dependabot PR is red. Each is merged, or closed with an `ignore` entry and a reason
- [ ] `pr-gate` checks are green on every merged PR
- [ ] Coverage stays at or above 80% per component

## Impacted consumers
- `backend/nestjs-*` templates are copied by downstream projects. Document breaking changes in the template changelog and bump the version (see the recent `0.1.2` bump).
- `cm-api` is consumed by `cm-webapp` and `cm-admin`. Re-run their contract/integration checks after Mongoose/NestJS changes.
- CI workflows under `.github/workflows/` depend on the commitlint config from Phase 0.

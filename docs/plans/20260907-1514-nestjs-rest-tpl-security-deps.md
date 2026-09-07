# Plan: NestJS REST template security dependencies

## Goal

Close **all 108 open Dependabot alerts** on [`backend/ms-nestjs-rest-tpl/package-lock.json`](../../backend/ms-nestjs-rest-tpl/package-lock.json) (3 critical, 54 high, 43 medium, 8 low), or at minimum every **critical and high**. Same approach as the GraphQL template: NestJS 10 → 11.2.x, explicit axios, targeted `overrides`. These are npm lockfile CVEs, not Node/Docker image issues.

## Scope

- Affected component(s): `backend/` bootstrap template [`backend/ms-nestjs-rest-tpl/`](../../backend/ms-nestjs-rest-tpl/) (`MS_NESTJS_REST`)
- Files to touch (estimate): ~6–10
  - [`backend/ms-nestjs-rest-tpl/package.json`](../../backend/ms-nestjs-rest-tpl/package.json) and `package-lock.json`
  - this plan file
  - [`backend/ms-nestjs-rest-tpl/README.md`](../../backend/ms-nestjs-rest-tpl/README.md) (still says Node v18)
  - Port GraphQL-template source/test fixes that this package still needs:
    - [`src/common/utils/http-client-utils.ts`](../../backend/ms-nestjs-rest-tpl/src/common/utils/http-client-utils.ts) (still returns a token string; GraphQL template now returns `Authorization` headers)
    - [`test/app.e2e-spec.ts`](../../backend/ms-nestjs-rest-tpl/test/app.e2e-spec.ts) (still expects `GET /` Hello World; app only exposes health under a global prefix)
- Out of scope (explicit):
  - **Node 20 → 22.** All 108 alerts are `ecosystem: npm`. Dockerfile [`ARG NODE_VERSION=20.18.1`](../../backend/ms-nestjs-rest-tpl/Dockerfile) and [`.nvmrc`](../../backend/ms-nestjs-rest-tpl/.nvmrc) stay on Node 20. Keep the existing `apk add git==2.47.2-r0` line.
  - GraphQL packages (`@nestjs/graphql`, `graphql`) — this is the REST template
  - Re-touching [`backend/ms-nestjs-gql-tpl/`](../../backend/ms-nestjs-gql-tpl/) (already on Nest 11.2.3)
  - Removing commitizen / husky / standard-version / lint-staged (REST-only tooling; keep it)
  - Dockerfile `npm ci --omit=dev` hardening

### Same as GraphQL template (reuse proven versions)

Copy the Nest 11 line already in [`backend/ms-nestjs-gql-tpl/package.json`](../../backend/ms-nestjs-gql-tpl/package.json), minus GraphQL:

- `@nestjs/common|core|platform-express|testing` → `^11.2.3`
- `@nestjs/axios` → `^4.0.1` and add **`axios`: `^1.20.0`** as a direct dependency
- `@nestjs/config` → `^4.0.4`, `@nestjs/terminus` → `^11.1.1`
- `@nestjs/cli` → `^11.0.24`, `@nestjs/schematics` → `^11.1.0`
- `uuid` → `^11.1.1`, `unleash-client` → `^6.12.1`
- Drop unused `@types/moment`
- Keep REST-only devDeps: `@commitlint/*`, `commitizen`, `cz-conventional-changelog`, `husky`, `lint-staged`, `standard-version`

Start from the GraphQL template’s **working** `overrides` (already iterated there), then add REST-only pins:

```json
"overrides": {
  "brace-expansion@1": "1.1.18",
  "brace-expansion@2": "2.1.4",
  "flatted": "3.4.4",
  "glob@11": "11.1.0",
  "handlebars": "4.7.9",
  "js-yaml@3": "3.15.2",
  "js-yaml@4": "4.3.2",
  "minimatch@3": "3.1.5",
  "minimatch@5": "5.1.9",
  "minimatch@9": "9.0.9",
  "minimatch@10": "10.2.6",
  "picomatch@2": "2.3.2"
}
```

`ws@7` is not expected here (no `@nestjs/graphql` / `subscriptions-transport-ws`). Add it only if `npm audit` still reports nested `ws@7`.

### REST-only extra alerts (not in GraphQL lockfile)

108 alerts overlap heavily with GraphQL, with these extras:

- **`handlebars@4.7.8` (critical + high)** — from `conventional-changelog-writer` via `standard-version`. Patch is **4.7.9**. Override is enough; no need to drop `standard-version`.
- `file-type@20.4.1` (medium) — currently pulled by `@nestjs/common@10.4.19`. Nest 11 should move this; if medium remains, document it.
- `fflate` (medium) — commit/changelog toolchain. Not required for the critical/high gate.

**Critical to close:** `form-data` (axios 1.20.0), `tar` (Nest CLI 11 / newer cacache), `handlebars@4.7.9`.

**High closed by Nest 11 (same as GraphQL):** `multer` 2.2.0, `axios` 1.20.0, Express 5 `path-to-regexp`, `lodash` via Nest 11, `ip-address` via `unleash-client` 6.12.1, plus the shared minimatch/brace-expansion/js-yaml overrides.

## Contract / interface

Bootstrap template, not a runtime import. Baseline for *new* REST services:

- NestJS **10 → 11.2.3**
- Express **4 → 5** (via `@nestjs/platform-express`)
- `@nestjs/axios` 4 / `@nestjs/config` 4 / `@nestjs/terminus` 11

HTTP routes (`/ms-nestjs-template/v1/health`, `/ready`) stay the same. No live `conference-manager/` Nest REST service today.

## Implementation steps

1. Write this plan from [`docs/plans/TEMPLATE.md`](TEMPLATE.md).
2. Update [`package.json`](../../backend/ms-nestjs-rest-tpl/package.json) to the GraphQL-template Nest 11 versions (no GraphQL packages). Add `overrides` including `handlebars: 4.7.9`. Keep husky/`prepare` and commitizen `config`.
3. `npm install` in `backend/ms-nestjs-rest-tpl/` to regenerate the lockfile. Run `npm audit`. Iterate overrides until **critical = 0 and high = 0**. Document leftover medium/low with GHSA if a parent has no compatible patch. Do not globally override `glob@7` (Jest 29).
4. Port GraphQL-template source/test fixes:
   - `getAPIRequestHeaders` must return `{ Authorization: Bearer ... }` (current REST helper fails its own unit test once types tighten)
   - e2e: `GET /ms-nestjs-template/v1/health` → `ok`, with `setGlobalPrefix` and `app.close()`, matching [`backend/ms-nestjs-gql-tpl/test/app.e2e-spec.ts`](../../backend/ms-nestjs-gql-tpl/test/app.e2e-spec.ts)
5. Verify: `npm run lint`, `npm run test:unit:coverage` (**≥ 80%**), `npm run test:e2e`, `npm run build`. Prefer Makefile/container if host Node differs.
6. README: replace “nodejs v18.xx” with **Node 20.18.1**. Do not claim Node 22.

## Risks

- Express 5 vs health/ready/e2e (same bounded surface as GraphQL template)
- `handlebars` override on `standard-version` / `commitizen` changelog writer — verify `npm run commitlint` still runs
- `tar` 6 → 7 via Nest CLI 11 — confirm `nest build` works
- `prepare: husky` may try to install hooks during `npm install`; if CI/sandbox fails, use `HUSKY=0 npm install`

## Acceptance criteria

- [ ] Plan file exists at `docs/plans/20260907-1514-nestjs-rest-tpl-security-deps.md`
- [ ] `npm audit` in `backend/ms-nestjs-rest-tpl`: **0 critical, 0 high**
- [ ] Remaining medium/low (if any) listed with package, GHSA, and why they cannot be bumped
- [ ] Unit coverage ≥ 80%; lint, unit, e2e, and `nest build` pass
- [ ] Commit tooling still present (`husky`, `commitlint`, `standard-version`)
- [ ] Node image / `.nvmrc` still **20.18.1**
- [ ] README Node version matches the Dockerfile

## Impacted consumers

- Future REST services bootstrapped from this template (Nest 11 + Express 5)
- No current `conference-manager/` Nest REST instance
- GraphQL template is already on this baseline and is not changed

Suggested commit:

```
fix(deps): patch NestJS REST template npm CVEs

Upgrade NestJS 10 to 11.2.x and override remaining transitive
packages so Dependabot critical/high alerts on the lockfile close.
```

# Plan: Standardize Nx `project.json` Across ADE Components

## Goal
Nx is installed (`nx.json`, `nx: "21.3.2"`) and 7 packages declare a `project.json`, but no workflow calls `nx` — CI gates on a hand-rolled bash script instead, and most `project.json` targets bypass the Makefile Unified CLI Facade ([ADR 0001](../adr/0001-makefile-unified-cli-facade.md)) or are simply broken. This plan makes `project.json` a working, standardized contract for every component, documents how to author one, and gives CI a real reason to use Nx.

## Scope
- Affected component(s): backend (3 templates), conference-manager (2 of 3 services: `ms-conference-api`, `ms-conference-webapp`), `cloud/terraform/aws`, `tools/knowledge-mcp`, `mobile-app` (2 templates, blocked), root `nx.json`, `.github/workflows`, `docs`
- Files to touch (estimate): 7 existing `project.json` (fix), `nx.json`, `get-changed-packages.sh`, `release.yml`, `monorepo-paths.md`, new `docs/Nx.md`, `docs/Tooling.md`
- Out of scope (explicit):
  - `conference-manager/ms-conference-admin` and `cli` — no `project.json` added in this plan; both components are **not ready yet** (owners still iterating on the Makefile/build setup). Revisit once they stabilize.
  - Renaming Makefile targets to one shared vocabulary across packages (see Risks)
  - `fastapi-rest-tpl` rename / uv migration — tracked in `20260908-2100-fastapi-rest-tpl-rename-uv-dependabot.md`
  - Adding Makefiles/containers to `mobile-app/*` (no Makefile exists today; a prerequisite for its own plan)
  - `devops/*.yml` — those are pipeline **templates** copied into consumer repos, not this monorepo's own CI
  - Azure Terraform (folder has no Makefile yet)

## Findings (current state)

### A. `project.json` inventory — 7 exist, 2 out of scope (not ready), 2 blocked
| Component | `project.json` | Status |
|---|---|---|
| `tools/knowledge-mcp` | ✅ | Correct — every target wraps `make <target>` with explicit `cwd`. **Reference pattern.** |
| `backend/nestjs-rest-tpl` | ✅ | Broken — calls `npm run build/start/test:unit:coverage` directly; no `cwd` (executes at repo root) |
| `backend/nestjs-gql-tpl` | ✅ | Same defect |
| `backend/fastapi-rest-tpl` | ✅ | Broken — executor `@nx/python:poetry-run` paired with `npm run …` commands (copy-paste bug); no `cwd` |
| `conference-manager/ms-conference-webapp` | ✅ | Broken — `npm run …` directly, no `cwd` |
| `conference-manager/ms-conference-api` | ✅ | Broken — `yarn build/start/test:unit-tests` directly (yarn, inconsistent with `npm` elsewhere), no `cwd` |
| `cloud/terraform/aws` | ✅ | Bypasses its own Makefile — calls the `terraform` binary directly even though `cloud/terraform/aws/Makefile` wraps `init/plan/apply/destroy`; `validate`/`fmt` targets have no Make equivalent yet |
| `conference-manager/ms-conference-admin` | ❌ | Has a Makefile (`build-dev`, `launch-local`, …), no `project.json` — **out of scope**, component not ready yet |
| `cli` | ❌ | Has a Makefile (`build-dev`, `run-unit-tests`, …), no `project.json` — **out of scope**, component not ready yet |
| `mobile-app/whitewalker` | ❌ | No Makefile, no `project.json` — blocked |
| `mobile-app/caraxes` | ❌ | No Makefile, no `project.json` — blocked. Also: `monorepo-paths.md` and `get-changed-packages.sh` still say `mobile-app/whitewolf(-rn)`, a path that does not exist |

### B. Nx is disconnected from CI
No workflow calls `nx`, `nx affected`, or `npx nx`. Change detection and job gating are done entirely by `.github/actions/get-changed-packages/get-changed-packages.sh`, a hardcoded path→label table that is already stale:
- `release.yml` gates the NestJS REST release job on `backend/ms-nestjs-rest-tpl` — the real path is `backend/nestjs-rest-tpl`, so that job can never fire.
- The changed-packages table lists `mobile-app/whitewolf/`, which does not exist (`caraxes` does).

`nx.json` also declares `"nxCloudId"`, but no workflow authenticates to Nx Cloud — remote caching is dead config.

### C. Makefile as Unified CLI Facade — verdict: keep it, it is working
7 of 11 packages ship a Makefile, and CI already calls `make build-dev` / `make lint` / `make unit-tests` for 5 of 7 gated jobs. The facade is the right abstraction and stays. The two exceptions — `fastapi-rest-tpl-unit-tests` and `pull_request_cli.yml` — call `docker build`/`docker run` directly, bypassing their **own** Makefiles too; that's a workflow bug, not evidence against the facade. The actual gap is one layer up: nothing enforces that `project.json` (or CI) goes through the facade instead of the underlying tool.

### D. Workflow requirements
| Workflow | Trigger | Requires | Issue found |
|---|---|---|---|
| `validate_commits.yml` | push/PR any branch | none | — |
| `pull_request_backend.yml` | PR, `backend/**` | `.github/actions/get-changed-packages` | fastapi job bypasses Makefile |
| `pull_request_cm_components.yml` | PR, `conference-manager/**` | same | lint step uses `continue-on-error: true` (silent lint failures) |
| `pull_request_cm_infrastructure.yml` | PR, `cloud/terraform/aws/**` | AWS OIDC role, `AWS_ROLE_ARN`, `BACKEND_AWS_S3_BUCKET/KEY`, `BACKEND_AWS_DYNAMODB_TABLE`, `DB_NAME/USERNAME/PASSWORD` | calls `terraform` directly, not via Makefile |
| `pull_request_knowledge_mcp.yml` | PR, `tools/knowledge-mcp/**` | same action | none — this is the clean example |
| `pull_request_cli.yml` | PR, `cli/**` | none | bypasses `cli/Makefile`, calls `docker build/run` directly |
| `ci_cm_components.yml` | push main / dispatch | `AWS_ROLE_ARN`, `vars.ENABLE_WEBAPP_DEPLOY`, `vars.ENABLE_API_DEPLOY` | — |
| `deploy_cm_infrastructure.yml` | manual/DEV env | `AWS_ROLE_ARN`, `AWS_ACCOUNT_ID`, `BACKEND_AWS_S3_*`, `DB_USERNAME/PASSWORD` | — |
| `destroy_cm_infrastructure.yml` | manual/DEV env | same as deploy | — |
| `release.yml` | push main / dispatch | `GH_PAT` | stale path, job never triggers (see B) |

## Contract / interface
Standard `project.json` shape, modeled on `tools/knowledge-mcp` (the only correct example today):

```json
{
  "name": "<package-name>",
  "sourceRoot": "<path/to/package>",
  "targets": {
    "<nx-target>": {
      "executor": "nx:run-commands",
      "options": { "command": "make <make-target>", "cwd": "<path/to/package>" }
    }
  }
}
```

- Nx target names (`build`, `serve`, `lint`, `test`) are the **stable cross-package contract**. A caller runs `nx run <project>:test` the same way for every component.
- The underlying Make target name stays package-specific and is not renamed by this plan (e.g. `fastapi-rest-tpl` keeps `run-tests`, `nestjs-rest-tpl` keeps `unit-tests` — both map to the nx `test` target).
- `cwd` is mandatory on every target — omitting it runs the command at the repo root, which is the root cause of today's breakage.
- Only expose the nx targets that have a real Make target; do not fabricate a `lint` target where the package's Makefile has none.

## Implementation steps

1. **`fix(nx): route existing project.json targets through make with explicit cwd`**
   Rewrite `backend/nestjs-rest-tpl`, `backend/nestjs-gql-tpl`, `conference-manager/ms-conference-webapp`, `conference-manager/ms-conference-api` `project.json` to call `make build-dev`/`make lint`/`make unit-tests`/`make launch-local` (per package) with `cwd` set, per the Contract above.

2. **`fix(nx): correct fastapi-rest-tpl project.json executor and commands`**
   Replace `@nx/python:poetry-run` + `npm run …` with `nx:run-commands` + `make build-dev`/`make run-tests`/`make launch-local` and `cwd`.

3. **`feat(cloud): route terraform aws project.json through the package Makefile`**
   Add `validate` and `fmt` targets to `cloud/terraform/aws/Makefile` (wrapping `terraform validate` / `terraform fmt -check`, matching `init/plan/apply/destroy`). Update `project.json` so every target calls `make <target>` instead of `terraform` directly.

4. **`fix(devops): correct stale package paths`**
   `release.yml`: `backend/ms-nestjs-rest-tpl` → `backend/nestjs-rest-tpl` (path, working-directory, npm-script name). `get-changed-packages.sh`: `mobile-app/whitewolf/` → `mobile-app/caraxes/`. `agents/shared/context/monorepo-paths.md`: `whitewolf-rn` → `caraxes`.

5. **`chore(nx): resolve dead nx.json config`**
   Remove `nxCloudId` (unused by any workflow) or wire `NX_CLOUD_ACCESS_TOKEN` in CI if remote caching is actually wanted — decide before merging, do not leave both undocumented. Confirm whether `workspaceLayout` (`appsDir`/`libsDir`/`infrastructureDir`) is load-bearing for Nx 21's project graph with explicit `project.json` files; if not, remove it rather than leave a misleading convention.

6. **`docs(nx): add docs/Nx.md and link it from docs/Tooling.md`**
   Document: what `nx.json` controls in this repo, the `project.json` contract from above, a copy-paste template for adding a new component, and the planned `nx affected` rollout carried out in step 7 below. Cross-link `ADR 0001` so the "Nx target → Make target → Docker/host CLI" chain is explicit in one place. Land this **before** step 7 so the pilot workflow follows a documented contract instead of establishing it ad hoc.

7. **`ci(workflows): adopt nx affected for one workflow as a pilot`**
   After steps 1–4 are merged and green (and step 6's docs are in place), replace the `get-changed-packages` + duplicated `make` steps in **one** low-risk workflow (`pull_request_knowledge_mcp.yml` or `pull_request_backend.yml`) with `npx nx affected -t lint,test,build`. Validate locally with the existing `act`-based Make targets (`make devops-pr-cm-infra-verify`, `devops-*`) before rolling out further. Do not touch all workflows in the same PR.

## Risks
- Step 7 (CI rewiring) is the highest-risk change — it replaces a working (if messy) gating mechanism. Pilot on one workflow, verify with `act`, before extending to the rest.
- Renaming Makefile targets to a single shared vocabulary (e.g. unifying `run-tests`/`unit-tests`) is tempting but out of scope here — it would also require editing every CI job that calls `make <target>` today; track as a separate follow-up if wanted.
- Removing `nxCloudId` is a one-way door if nobody has the original Nx Cloud workspace credentials; confirm ownership before deleting rather than just wiring a token.
- `mobile-app/*` has missing or partial Make target sets (no `lint`, no Makefile at all). Do not fabricate targets to look "standardized" — gaps in the Makefile itself are separate, package-level work.

## Acceptance criteria
- [ ] Every `project.json` target invokes `make <target>` with an explicit `cwd` — no raw `npm`/`yarn`/`docker`/`terraform` calls
- [ ] `nx run <project>:test|lint|build` succeeds locally for every component that already has a `project.json` (`ms-conference-admin` and `cli` are out of scope — no Makefile-backed `project.json` for them yet)
- [ ] `fastapi-rest-tpl` `project.json` no longer references the Python poetry executor with npm commands
- [ ] `release.yml`, `get-changed-packages.sh`, `monorepo-paths.md` contain no stale paths
- [ ] `docs/Nx.md` exists, is linked from `docs/Tooling.md`, and documents the `project.json` contract
- [ ] `nx.json`'s `nxCloudId` is either removed or actively used by a workflow — no dead config
- [ ] One workflow uses `nx affected` instead of only the hand-rolled bash matrix, verified via `act`

## Impacted consumers
- All PR-gating and release GitHub Actions workflows (behavior changes in step 7)
- Anyone currently running `nx run ...` locally — today this is broken for 6 of 7 existing `project.json` files, so there is no working behavior to regress
- `agents/shared/context/monorepo-paths.md` consumers (agents/skills that read it as source of truth for paths)
- Not impacted: `tools/knowledge-mcp` scaffold/gap-detection logic — it does not reference `project.json` today

## Suggested commits
```
fix(nx): route existing project.json targets through make with explicit cwd
fix(nx): correct fastapi-rest-tpl project.json executor and commands
feat(cloud): route terraform aws project.json through the package Makefile
fix(devops): correct stale package paths in release workflow and changed-packages script
chore(nx): resolve dead nx.json config (nxCloudId / workspaceLayout)
docs(nx): add docs/Nx.md describing the project.json contract
ci(workflows): adopt nx affected for knowledge-mcp pull request pipeline
```

## Suggested PR strategy
Steps 1–4 are mechanical and low-risk — one PR. Step 5 is a config decision — small separate PR once the Nx Cloud ownership question is answered. Step 6 (docs) can ship with 1–4 or on its own, but must land before step 7. Step 7 is the only behavior-changing CI step — its own PR, pilot workflow only, after step 6's docs are merged.

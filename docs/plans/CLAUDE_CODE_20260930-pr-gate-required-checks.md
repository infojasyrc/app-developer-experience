# Plan: pr-gate aggregate checks + required status checks on main

## Goal
Add an always-reporting `pr-gate-*` job to the `pull_request_*` workflows that use change detection, then require those checks in the `main` ruleset so a PR can merge only when every relevant verify job passed (or was legitimately skipped).

## Scope
- Affected component(s): `.github/workflows/`, GitHub ruleset `main` (id 4235950)
- Files to touch (estimate):
  - `.github/workflows/pull_request_backend.yml`
  - `.github/workflows/pull_request_cm_components.yml`
  - `.github/workflows/pull_request_knowledge_mcp.yml`
  - `docs/standards/pull-requests.md` (document required checks)
- Out of scope (explicit):
  - `pull_request_cli.yml`, `pull_request_knowledge_governance.yml`: keep `paths:` filters, no gate, not required (no change detection; a path-filtered required check stays "Pending" when the workflow doesn't trigger).
  - `pull_request_cm_infrastructure.yml`: excluded (terraform plan needs AWS OIDC/secrets); stays informational.
  - `validate_commits.yml`: not required for now.
  - Managing the ruleset via github cli.

## Contract / interface
Each gated workflow exposes one required check named by its gate job:

| Workflow | Gate job (check name) | `needs` |
|---|---|---|
| pull_request_backend | `pr-gate-templates` | get-changed-packages, nestjs-rest-tpl-unit-tests, nestjs-gql-tpl-unit-tests, fastapi-rest-tpl-unit-tests |
| pull_request_cm_components | `pr-gate-cm-components` | get-changed-packages, conference-webapp-verify, conference-api-verify |
| pull_request_knowledge_mcp | `pr-gate-knowledge-mcp` | get-changed-packages, knowledge-mcp-unit-tests |

Gate semantics (from the provided snippet): `get-changed-packages` must be `success` (otherwise skipped verifies would be false passes); each verify job must be `success` or `skipped`, never `failure`/`cancelled`. `if: always()` so the gate runs even when upstream jobs fail or are skipped.

Check names must be unique across workflows because required checks match by job name.

## Implementation steps
1. **Remove `paths:` filter** from the three gated workflows (keep `branches: [main]`). Without this the workflow doesn't trigger on unrelated PRs and the required check never reports. `get-changed-packages` (`.github/actions/get-changed-packages`) already decides which verify jobs run. First confirm the action returns a sensible (empty) result for PRs touching none of the packages, not an error.
2. **Add the gate job** to each workflow, based on the snippet:
   ```yaml
   pr-gate-cm-components:
     name: pr-gate-cm-components
     needs: [get-changed-packages, conference-webapp-verify, conference-api-verify]
     if: always()
     runs-on: ubuntu-24.04
     steps:
       - name: Enforce results
         env:
           DETECT: ${{ needs.get-changed-packages.result }}
           RESULTS: ${{ join(needs.*.result, ' ') }}
         run: |
           [[ "$DETECT" == "success" ]] || { echo "Detection: $DETECT"; exit 1; }
           for r in $RESULTS; do
             [[ "$r" == "success" || "$r" == "skipped" ]] || { echo "Job result: $r"; exit 1; }
           done
   ```
   Using `env` + `join(needs.*.result, ' ')` avoids inline `${{ }}` in the script and means new verify jobs only need adding to `needs`. (`get-changed-packages` is `success` in the loop too, which is fine.)
3. **Open a PR** (branch `ci/pr-gate-required-checks`, repo PR template). The gates must run at least once before they can be selected as required checks.
4. **After merge, update the ruleset** (human-run, `gh api`). Currently `required_status_checks: []`. Fetch current rules first and PATCH preserving `deletion` and `pull_request` rules:
   ```bash
   gh api -X PUT repos/infojasyrc/app-developer-experience/rulesets/4235950 --input ruleset.json
   ```
   where `required_status_checks` becomes:
   ```json
   [
     {"context": "pr-gate-templates"},
     {"context": "pr-gate-cm-components"},
     {"context": "pr-gate-knowledge-mcp"}
   ]
   ```
   Keep `strict_required_status_checks_policy: false` initially (avoids forced rebase-on-every-merge); revisit later. Optionally set `integration_id` to GitHub Actions (15368) to prevent spoofed checks.
5. **Document** the required checks and how to add a new verify job to a gate's `needs` in `docs/standards/pull-requests.md`.

## Risks
- Removing `paths:` makes `get-changed-packages` run on every PR to main (a cheap job, but nonzero cost).
- A verify job missing from a gate's `needs` is silently ungated. Mitigation: documented in step 5.
- Ruleset has no bypass actors; a broken gate blocks everyone including admins. Mitigation: only enable after gates have passed on a real PR; keep the `gh api` rollback (empty array) at hand.
- Ruleset isn't tracked in the repo, so drift is possible (accepted; Terraform is out of scope).
- Docs-only PRs: all verify jobs skipped, gate passes. This is intended.

## Acceptance criteria
- [ ] PR touching only `README.md`: all three gates report success; PR mergeable.
- [ ] PR touching `conference-manager/ms-conference-api/**` with a failing test: `pr-gate-cm-components` fails; merge blocked.
- [ ] PR where `get-changed-packages` fails: gate fails (no false pass).
- [ ] Cancelled verify job: gate fails.
- [ ] Ruleset `main` lists the three required contexts; merge button is disabled until they pass.
- [ ] cli, governance, and infra workflows are unchanged and non-blocking.

## Impacted consumers
- Every contributor PR to `main`.
- `docs/standards/pull-requests.md`; knowledge-mcp ingests this file (see `pull_request_knowledge_governance.yml`), so keep its format parseable.
- Dependabot PRs (touch `backend/**`, `conference-manager/**`) will now be gated by these checks.

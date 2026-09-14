# Nx

Nx (`nx: 21.3.2`, config in [`nx.json`](../nx.json)) provides one standardized
way to run any package's `build`/`lint`/`test`/`serve` — `nx run <project>:<target>` —
regardless of what's underneath. What's underneath is always the
[Makefile Unified CLI Facade](./Tooling.md#automation-with-makefiles)
([ADR 0001](./adr/0001-makefile-unified-cli-facade.md)): Nx target → `make <target>` → Docker/host CLI.

CI does not call `nx` yet — see [Planned `nx affected` rollout](#planned-nx-affected-rollout) below.

## What `nx.json` controls here

- `targetDefaults.build` — declares `{projectRoot}/dist` as the cacheable output for `build` targets.
- `nxCloudId` — this workspace is registered with Nx Cloud, but no workflow
  authenticates to it yet, so remote caching is not active in CI. Wiring it up
  is a deliberate follow-up, not a bug — see
  [Wiring up `NX_CLOUD_ACCESS_TOKEN`](#wiring-up-nx_cloud_access_token) below.
- `workspaceLayout` is intentionally **not** set. Every package declares its
  own `sourceRoot` explicitly in its `project.json`, so Nx's project graph
  doesn't need it, and nothing here uses `nx generate` to rely on default
  `appsDir`/`libsDir` inference.

## The `project.json` contract

Every `project.json` in this repo follows the same shape, modeled on
`tools/knowledge-mcp` (the reference example):

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

Rules:

- **Nx target names are the stable cross-package contract.** Use `build`,
  `lint`, `test`, `serve` (add others — e.g. `init`/`plan`/`apply` for
  Terraform — only where the package has no better fit). A caller runs
  `nx run <project>:test` the same way for every component.
- **The underlying `make` target name stays package-specific.** This plan
  does not rename Makefile targets — e.g. `fastapi-rest-tpl` keeps
  `unit-tests`, `nestjs-rest-tpl` also keeps `unit-tests`, but a package with
  a differently named Make target still maps to the nx `test` target.
- **`cwd` is mandatory on every target.** Omitting it runs the command at the
  repo root instead of the package directory — this was the root cause of
  most of the breakage this contract fixes.
- **Only expose nx targets that have a real Make target.** Don't fabricate a
  `lint` target where the package's Makefile has none.

## Adding `project.json` to a new component

1. Confirm the package already has a working Makefile (`make help` lists its
   targets) — `project.json` wraps Make, it doesn't replace it.
2. Copy this template into `<package>/project.json`:

   ```json
   {
     "name": "<package-name>",
     "sourceRoot": "<path/to/package>",
     "targets": {
       "build": {
         "executor": "nx:run-commands",
         "options": { "command": "make build-dev", "cwd": "<path/to/package>" }
       },
       "lint": {
         "executor": "nx:run-commands",
         "options": { "command": "make lint", "cwd": "<path/to/package>" }
       },
       "test": {
         "executor": "nx:run-commands",
         "options": { "command": "make unit-tests", "cwd": "<path/to/package>" }
       },
       "serve": {
         "executor": "nx:run-commands",
         "options": { "command": "make launch-local", "cwd": "<path/to/package>" }
       }
     }
   }
   ```

3. Swap each `make <target>` for whatever that package's Makefile actually
   calls that step (check with `make help` in the package directory) — drop
   any target the Makefile doesn't have.
4. Verify locally: `nx run <project>:build`, `nx run <project>:lint`,
   `nx run <project>:test` should each produce the same result as running the
   `make` command directly from that directory.

`conference-manager/ms-conference-admin` and `cli` do not have a
`project.json` yet — both are still stabilizing their build setup and are
intentionally out of scope until they're ready.
`mobile-app/whitewalker` and `mobile-app/caraxes` have no Makefile at all
yet, so they're blocked on that prerequisite first.

## Planned `nx affected` rollout

CI currently gates jobs with
`.github/actions/get-changed-packages/get-changed-packages.sh`, a hand-rolled
path→label table, not `nx affected`. The plan is to pilot
`npx nx affected -t lint,test,build` on **one** low-risk workflow first
(`pull_request_knowledge_mcp.yml` or `pull_request_backend.yml`), validated
locally with the existing `act`-based Make targets, before touching any other
workflow. This is a deliberate, incremental swap — not a repo-wide rewrite —
because it replaces a working (if messy) gating mechanism.

## Wiring up `NX_CLOUD_ACCESS_TOKEN`

Not done yet — there's nothing for Nx Cloud to cache until the `nx affected`
rollout above lands in at least one workflow. When that's ready:

1. In the [Nx Cloud dashboard](https://cloud.nx.app), open the workspace
   matching this repo's `nxCloudId` (`nx.json`) and generate a CI access
   token (read-write, scoped to this workspace).
2. Add it as a GitHub Actions secret — `NX_CLOUD_ACCESS_TOKEN` — on this repo
   or the `hakoopro-com` org, so it's available to workflow runs.
3. Reference it in the pilot workflow's job:
   ```yaml
   env:
     NX_CLOUD_ACCESS_TOKEN: ${{ secrets.NX_CLOUD_ACCESS_TOKEN }}
   ```
4. No other config changes needed — `nx.json` already has the matching
   `nxCloudId`, so any `nx run`/`nx affected` call in that job will start
   reading/writing the remote cache automatically once the token is present.
5. Confirm it's working: a second CI run over the same unchanged inputs
   should show a cache hit (`nx` logs `[remote cache]`) instead of
   re-executing the task.

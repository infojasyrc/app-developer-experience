# Adopting ADE in a child project

This guide is for teams who want to use App Developer Experience (ADE) in a
repository outside ADE, called a **child project**. It covers:
- scaffolding services from released ADE templates;
- keeping a record of what was generated;
- connecting your agents to ADE conventions.

> **Status: roadmap Phase 2.** `appdevexp` runs from an ADE clone, as a
> container image you build once. Published binaries and a GHCR image arrive
> in Phase 7. Every step below uses only `git`, `make` and a container
> runtime. You never need a host Python or Node.

---

## What you get

| Capability | How | Since |
|---|---|---|
| New backend service from a released, checksummed template (`fastapi-rest`, `nestjs-rest`, `nestjs-gql`) | `appdevexp new service` | Phase 2 |
| A receipt of every generated artifact, with versions and answers | `.ade/answers.yaml` in your repo | Phase 2 |
| ADE conventions served to Cursor, VS Code, Claude Code and other agents | Knowledge MCP ([KnowledgeMCP.md](./KnowledgeMCP.md)) | available |
| Gap report of your repo against ADE conventions | `compare_gaps` MCP tool | available |
| Reusable CI workflows, `update` to newer template versions, `doctor`, `propose` | `appdevexp` | Phases 3–6 |

---

## Step 1 — Prerequisites

- `git`, `make`, and a container runtime: Docker Desktop, Podman, or Apple `container`. The `cli` Makefile uses `docker`.
- Network access to `github.com`. Templates are downloaded from ADE's public GitHub releases.
- A child repository that is either:
  - a **monorepo**: it has an `nx.json` at its root, and services go to `backend/<name>`; or
  - a **standalone** folder: the service goes to `./<name>`.

## Step 2 — Clone ADE and build `appdevexp` once

```bash
git clone https://github.com/infojasyrc/app-developer-experience.git ~/src/ade
cd ~/src/ade/cli
make create-volumes
make build-prod          # image app-dev-exp-cli: the appdevexp binary, ADE core engine embedded
make scaffold ARGS="--version"
# appdevexp 0.3.0 (ade-core 0.2.0)
```

Your ADE clone is only used to build the CLI. Templates are **not** read from
the clone; they come from released bundles. To upgrade the CLI later, run
`git pull` and then `make build-prod`.

## Step 3 — Make `appdevexp` handy in your shell

Pick one of the two forms.

```bash
# a) Make, from anywhere (TARGET_DIR is your repository root)
make -C ~/src/ade/cli scaffold TARGET_DIR="$PWD" ARGS="list"

# b) A shell function (add it to ~/.zshrc or ~/.bashrc)
appdevexp() {
  mkdir -p "$HOME/.cache/appdevexp"
  docker run --rm -it --user "$(id -u):$(id -g)" \
    -e HOME=/tmp -e XDG_CACHE_HOME=/cache -e GITHUB_TOKEN \
    -v "$HOME/.cache/appdevexp":/cache/appdevexp \
    -v "$PWD":/work -w /work \
    app-dev-exp-cli "$@"
}
```

The container sees **only your current directory** (`/work`) and the
download cache. It writes files as your own user. Always run it from your
**repository root**, so that `nx.json`, `.env.public` and sibling services are
detected.

The rest of this guide uses form (b): `appdevexp …`.

## Step 4 — See what you can generate

```bash
appdevexp list
```

```text
ARTIFACT         KIND               LATEST       VERSIONS
fastapi-rest     project-template   0.2.0        0.2.0
nestjs-gql       project-template   0.0.1        0.0.1
nestjs-rest      project-template   0.3.0        0.3.0
```

The list comes from `artifacts-index.json`, published on ADE's rolling
`index` release. It is cached for 24h; add `--refresh` right after an ADE
release.

| Template | Features (`--feature key=value`) |
|---|---|
| `nestjs-rest`, `nestjs-gql` | `feature_flags=unleash\|none`, `database=postgres\|none` |
| `fastapi-rest` | `database=postgres\|none`, `auth=jwt\|none` |

## Step 5 — Preview the service (dry run)

```bash
appdevexp new service --template nestjs-rest@^0.3 --name orders-api \
  --feature feature_flags=none --dry-run
```

```text
Plan (nestjs-rest@0.3.0 → backend/orders-api)
  source    github:infojasyrc/app-developer-experience@nestjs-rest-tpl-v0.3.0
  layout    monorepo (/work)
  + backend/orders-api/   34 files
  features  feature_flags=none database=postgres
  params    project_name=acme compose_project_name=orders-api platform=linux/arm64 container_runtime=docker http_port=4001
  + .ade/answers.yaml
  ⚠ HTTP_PORT 4000 is used by backend/billing; using 4001
Nothing written.
```

**What happens during the dry run:**
- The bundle is downloaded once and checked against the sha256 in the index.
- The service is rendered into a private staging folder.
- Nothing is written to your repo.

**Values are taken from, in order of precedence:**
1. Flags.
2. `--answers file.yaml`.
3. Your repo:
   - `nx.json` → `backend/<name>`;
   - root `.env.public` / `.env` → `PROJECT_NAME`, `PLATFORM`, `CONTAINER_RUNTIME`;
   - sibling services' `HTTP_PORT` → the next free port.
4. Template defaults.

**Versions:** `@latest` (default), `@0.3.0`, `@^0.3` (any `0.3.x`), or `@~0.3.1`.

**Destination:** `--output-dir services/orders-api` puts the service elsewhere.

Run `appdevexp new service` with no flags for an interactive wizard.

## Step 6 — Create it and run the template's Make targets

```bash
appdevexp new service --template nestjs-rest@^0.3 --name orders-api --feature feature_flags=none --yes
cd backend/orders-api
make create-volumes
make build-dev
make install-dependencies
make lint
make unit-tests
make launch-local
```

`appdevexp` never runs installs. The generated service is container-first, and
its **Makefile is the only entry point** ([ADR 0001](./adr/0001-makefile-unified-cli-facade.md)).
Do not run host `npm`, `node`, `python`, `uv` or `poetry` in it.

**Reproducible runs** (CI, docs, or the same answers for several services):

```yaml
# orders-api.answers.yaml
template: nestjs-rest@^0.3
parameters: { name: orders-api, http_port: 4100 }
features: { feature_flags: none, database: postgres }
```

```bash
appdevexp new service --answers orders-api.answers.yaml --yes --format json
```

## Step 7 — Commit the service **and** `.ade/answers.yaml`

```bash
git add backend/orders-api .ade/answers.yaml
git commit -m "feat(orders-api): scaffold from nestjs-rest 0.3.0"
```

`.ade/answers.yaml` is the receipt. It records the template, version, source,
parameters and features of every generated service:

- **Phase 5:** `appdevexp update` renders the old and the new template version
  from these answers and opens a 3-way-merged PR.
- **Phase 5:** `doctor` checks the receipt against your files.
- **Phase 6:** ADE learns what teams change after scaffolding, but only if you opt in.

Do not hand-edit the receipt. Re-running `new` for the same `output_dir`
replaces that entry.

## Step 8 — Connect your agents to ADE conventions

Follow [KnowledgeMCP.md](./KnowledgeMCP.md) to register the Knowledge MCP
server in Cursor, VS Code, Claude Code or Antigravity. After that, your agents
can call:
- `get_convention("container-first")`;
- `get_convention("all")` (every topic);
- `compare_gaps(...)` on your repo.

Prefer `appdevexp new` over asking an agent to write a service from scratch:
- deterministic generation costs no tokens;
- it can be reviewed as a diff against a known release;
- it can be upgraded later.

Leave the agent the domain logic that no template covers.

## Step 9 — Send learnings back to ADE

Until Phase 6 (`appdevexp propose`, `sync collect`), feedback is a human PR
to ADE that edits the single source of truth. See
[KnowledgeMCP.md, Step 8](./KnowledgeMCP.md#step-8--send-real-gaps-back-to-ade-human-pr).
For example: a template default every team changes, or a convention that
does not fit your context.

---

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `The artifacts index is not available` | No network, or ADE has not published the `index` release yet. Use `--index-url https://…/artifacts-index.json`, or a maintainer's working copy with `--source path:/abs/template/dir` |
| `offline: using the cached artifacts index` | The network failed; the last cached index (in `~/.cache/appdevexp`) was used. Generation still works when the bundle is cached too |
| `checksum mismatch` | The download is corrupted or was tampered with. Nothing was written. Retry, and report it to ADE maintainers if it persists |
| `requires ade-core >= X` | The template needs a newer engine. Run `git pull` in your ADE clone, then `make build-prod` in `cli/` |
| `destination already exists and is not empty` | Pick another `--name` / `--output-dir`. `appdevexp` never overwrites files |
| `pass --yes to apply without a terminal` | You ran without a TTY (CI or scripts). Add `--yes`, or use `--dry-run` |
| Wrong layout (`orders-api` instead of `backend/orders-api`) | Run from the repository root that holds `nx.json`, or pass `--output-dir` |
| Private fork or mirror of ADE | `--registry owner/repo`, with `GITHUB_TOKEN` exported (the shell function and `make scaffold` forward it) |

## What's next

| Phase | Child projects gain |
|---|---|
| 3 | `appdevexp mcp` (no separate Knowledge MCP image) and `sync pull` for versioned org knowledge |
| 4 | Reusable `workflow_call` CI workflows (`workflows-v1`) and `appdevexp add workflow` |
| 5 | `appdevexp update` (template upgrades as PRs), `doctor`, dependency pruning for disabled features |
| 6 | `register`, `propose`, fleet reports: ADE learns from child projects |
| 7 | Released multi-OS binaries and a GHCR image: no ADE clone needed |

Design and rationale: [ADE scaffolding and knowledge platform](./analysis/ade-scaffolding-and-knowledge-platform.md).

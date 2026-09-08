# Use the Knowledge MCP from another repository

This guide is for a **consumer repo** (any service or app outside this monorepo).
The Knowledge MCP is a runtime service in ADE (`tools/knowledge-mcp/`). It is not
a bootstrap template. It exposes org conventions and reports setup gaps. It does
not rewrite your repository.

You need a local clone of `app-developer-experience` so the server can read
`CLAUDE.md`, `AGENTS.md`, `.cursor/rules`, and `development-guidance.md`.

## What you get

| Kind | Name | Use it when… |
|---|---|---|
| Resource | `conventions://tech-stack` | You need the ADE stack map |
| Resource | `conventions://ddd-clean-architecture` | You need DDD / Clean Architecture rules |
| Resource | `conventions://plan-template` | You are writing a plan |
| Resource | `conventions://container-first` | You need Makefile + Docker lifecycle |
| Resource | `conventions://component/{name}` | You need a specific area (`backend`, `cli`, …) |
| Tool | `get_convention(topic)` | You want excerpts + `source_path` |
| Tool | `scaffold_guidance(component_type)` | You are starting a new service/pipeline/app |
| Tool | `compare_gaps(target_repo_manifest)` | You want a gap report against ADE conventions |

`makefile` and `make-targets` are aliases of `container-first`.

---

## Step 1 — Prerequisites

On the machine that will run the client:

1. Docker Desktop (or Docker Engine) is installed and running.
2. You can clone GitHub repositories.
3. You have an MCP-compatible client (Cursor is the one used in this org).

---

## Step 2 — Clone ADE and note the absolute path

```bash
git clone git@github.com:infojasyrc/app-developer-experience.git
cd app-developer-experience
pwd
```

Save that absolute path. Below it is referred to as `<ADE_ROOT>`.
Example: `/Users/you/Projects/app-developer-experience`.

Keep this clone on the same machine as the consumer repo. The MCP container
mounts `<ADE_ROOT>` read-only to ingest conventions.

---

## Step 3 — Build the MCP image once

From ADE, use only Make (no host `python` / `poetry`):

```bash
cd <ADE_ROOT>/tools/knowledge-mcp
make help
make build-dev
make install-dependencies
```

`PLATFORM` defaults to `linux/amd64` from `.env.public`. On Apple Silicon you may
set `PLATFORM=linux/arm64` in a local `.env` under `tools/knowledge-mcp/`.

Optional check:

```bash
make lint
make unit-tests
```

Rebuild `make build-dev` after a Dockerfile change. Re-run
`make install-dependencies` if Python packages fail to import.

Refresh the knowledge index after ADE convention files change:

```bash
make sync
```

---

## Step 4 — Configure the consumer repository

In the **consumer** repo (not ADE), add an MCP server entry that starts the
container over stdio.

### Cursor (project)

Create or edit `<consumer-repo>/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "ade-knowledge": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--platform",
        "linux/amd64",
        "-e",
        "ADE_ROOT=/repo",
        "-e",
        "PYTHONPATH=/app/src",
        "-v",
        "<ADE_ROOT>:/repo:ro",
        "-v",
        "<ADE_ROOT>/tools/knowledge-mcp:/app",
        "-v",
        "knowledge-mcp-packages:/app/.venv",
        "knowledge-mcp-dev",
        "poetry",
        "run",
        "python",
        "-m",
        "stdio_main"
      ]
    }
  }
}
```

Replace **both** `<ADE_ROOT>` occurrences with the absolute path from Step 2.
JSON does not expand `~` or environment variables in this file — use a full path.

### Cursor (user-wide)

To share the server across every local repo, put the same `mcpServers` object in
`~/.cursor/mcp.json` instead of the project file.

### Optional: HTTP / SSE instead of stdio

If you prefer one long-lived process:

```bash
cd <ADE_ROOT>/tools/knowledge-mcp
make launch
```

Healthcheck: `GET http://localhost:8000/healthcheck/`

MCP HTTP endpoint: `http://localhost:8000/mcp`

Point the client at that URL if it supports Streamable HTTP / SSE. Stop with
`make stop`. Stdio (Step 4 project file) is the default for local editors.

---

## Step 5 — Restart the client and confirm the server

1. Restart the editor or reload MCP servers.
2. Open the MCP / tools panel and confirm `ade-knowledge` is connected.
3. You should see `get_convention`, `scaffold_guidance`, and `compare_gaps`.

If it fails:

| Symptom | What to check |
|---|---|
| Server never starts | Docker is running; `docker images` lists `knowledge-mcp-dev` |
| Volume errors | `<ADE_ROOT>` is absolute and the clone still exists |
| Empty conventions | `<ADE_ROOT>/CLAUDE.md` exists; run `make sync` |
| Apple Silicon / platform | Match `--platform` with `.env` / `.env.public` |

---

## Step 6 — Ask for conventions while you build

In the consumer repo, ask the agent (or call the tool) with a topic:

| You want | Call |
|---|---|
| Makefile + containers | `get_convention("container-first")` |
| DDD / layers | `get_convention("ddd")` |
| Which template to copy | `scaffold_guidance("nestjs-rest")` |
| Plan format | Read resource `conventions://plan-template` |

`scaffold_guidance` accepts aliases such as `NESTJS_REST`, `MS_FASTAPI`,
`nestjs-gql`, `ci-aws-backend`, `mobile-rn`, `terraform-aws`.

`conference-manager` is **not** a template. The tool returns an error and points
you at the backend or mobile templates instead.

Copy the template directory yourself. The MCP does not scaffold files into the
consumer repo.

---

## Step 7 — Report gaps in the consumer repo

Build a manifest of what the consumer repo already has, then call
`compare_gaps`.

```json
{
  "files": [
    "Makefile",
    "Dockerfile",
    "commitlint.config.js",
    ".husky/commit-msg"
  ],
  "makefile_targets": [
    "build-dev",
    "install-dependencies",
    "lint",
    "help",
    "launch-local",
    "stop-local",
    "unit-tests"
  ],
  "makefile_wraps_docker": true,
  "makefile_wraps_host_runtime": false,
  "tools": ["commitlint"],
  "stack": ["nestjs"],
  "identity": "my-service",
  "expect_iac": false
}
```

| Field | Meaning |
|---|---|
| `files` | Paths or basenames the client detected |
| `makefile_targets` | Target names from the consumer `Makefile` |
| `makefile_wraps_docker` | `true` if Make runs Docker, not host `npm`/`python` |
| `makefile_wraps_host_runtime` | `true` if Make only wraps host runtimes (this is a gap) |
| `tools` | Detected tools (`commitlint`, `terraform`, …) |
| `stack` | Detected stacks (`nestjs`, `fastapi`, `django`, …) |
| `identity` / `path` | Repo id. Use `conference-manager` only for that ADE solution |
| `expect_iac` | `true` to require Terraform, Bicep, SAM, or CDK |

The response lists `gaps` and, when applicable, `documented_exceptions`.
Conference Manager’s Django vs FastAPI/NestJS mismatch is an exception, not a
gap. The same Django stack in any other repo is a gap.

The tool **does not** create a Makefile, Dockerfile, or commitlint config in
your repo. You apply the fixes (or ignore a documented exception).

---

## Step 8 — Send real gaps back to ADE (human PR)

If `compare_gaps` finds something that should change **org** convention (not
just your repo):

1. Open a pull request on `app-developer-experience`.
2. Edit the source of truth: `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*.mdc`,
   `agents/shared/context/development-guidance.md`, and/or
   `tools/knowledge-mcp/data/reference.yaml`.
3. Do not add a second copy of the rule inside the MCP package. Run
   `make sync` after the knowledge files change.

False positives belong under `documented_exceptions` in `reference.yaml`.

---

## Related

- Package README and Make targets: [`tools/knowledge-mcp/README.md`](../tools/knowledge-mcp/README.md)
- Implementation plan: [`docs/plans/20260908-knowledge-mcp-server.md`](./plans/20260908-knowledge-mcp-server.md)
- Path alias: `KNOWLEDGE_MCP` in [`agents/shared/context/monorepo-paths.md`](../agents/shared/context/monorepo-paths.md)

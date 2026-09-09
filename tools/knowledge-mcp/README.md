# Knowledge MCP

Runtime MCP server that exposes ADE conventions (`CLAUDE.md`, `AGENTS.md`,
`.cursor/rules/*.mdc`, `development-guidance.md`) to other repos and agents.

This is a **service**, not a bootstrap template. Path alias: `KNOWLEDGE_MCP`
(`tools/knowledge-mcp/`).

## Conventions

Unified CLI Facade (container-first for this service). From this directory:

```bash
make help
```

Use only Make targets. Never run host `python`, `pip`, `uv`, or `npm`.

| Target | Purpose |
|---|---|
| `make build-dev` | Build the dev image |
| `make install-dependencies` | Install uv deps into the volume (`uv.lock`) |
| `make lint` | Black, isort, flake8 inside the container |
| `make unit-tests` | Pytest + coverage (80% minimum) |
| `make launch` / `make launch-local` | HTTP/SSE server on port 8000 |
| `make stop` / `make stop-local` | Stop the local server |
| `make sync` | Rebuild `dist/knowledge.json` (`nx run knowledge-mcp:sync`) |
| `make build-prod` | Production image |
| `make interactive` | Shell inside the container |

`PLATFORM` comes from `.env.public` (default `linux/amd64`). Override in a local `.env`.

## Environment variables

Make loads `.env` when that file exists, otherwise `.env.public`. Do not commit
`.env` (it is gitignored). The application also reads `.env` via
`pydantic-settings`.

### Make / Docker

| Variable | Default (`.env.public`) | Purpose |
|---|---|---|
| `COMPOSE_PROJECT_NAME` | `knowledge-mcp` | Image and container name prefix (`knowledge-mcp-dev`, `knowledge-mcp`) |
| `PLATFORM` | `linux/amd64` | Docker `--platform`. Allowed: `linux/amd64`, `linux/arm64`, `linux/x86_64` |
| `HTTP_PORT` | `8000` | Host port mapped to container `8000` for `make launch` |
| `ADE_ROOT` | `/repo` | ADE monorepo root **inside the container** (the host clone is mounted at `/repo`) |
| `INDEX_PATH` | `/app/dist/knowledge.json` | Written by `make sync`; read at runtime if the file exists |

### Application runtime

| Variable | Default | Purpose |
|---|---|---|
| `ADE_ROOT` | unset (walks parents for `CLAUDE.md` + `AGENTS.md`) | Path to the ADE clone the server ingests |
| `INDEX_PATH` | `dist/knowledge.json` | Optional pre-built knowledge index |
| `PYTHONPATH` | `/app/src` | Set by the image and Make so `stdio_main` / `main` import |
| `DEBUG` | `true` | FastAPI debug flag |
| `ENVIRONMENT` | `development` | `development`, `testing`, or `production` |
| `HOST` | `0.0.0.0` | Bind address for the HTTP server |
| `API_PORT` | `8000` | In-container listen port (keep `8000`; change the host mapping with `HTTP_PORT`) |
| `APP_NAME` | `knowledge-mcp` | FastAPI title |
| `APP_VERSION` | `0.1.0` | FastAPI version |

### Examples

Local override on Apple Silicon (`tools/knowledge-mcp/.env`, not committed):

```bash
COMPOSE_PROJECT_NAME=knowledge-mcp
PLATFORM=linux/arm64
HTTP_PORT=8000
ADE_ROOT=/repo
INDEX_PATH=/app/dist/knowledge.json
```

HTTP server on a different host port:

```bash
HTTP_PORT=18000
```

Then `make launch` publishes `http://localhost:18000` and the healthcheck is
`GET http://localhost:18000/healthcheck/`.

Stdio / MCP clients (values passed with `-e`; `ADE_ROOT` is the in-container mount):

```bash
-e ADE_ROOT=/repo
-e PYTHONPATH=/app/src
-e INDEX_PATH=/app/dist/knowledge.json
```

## MCP surface (v1)

Resources:

- `conventions://tech-stack`
- `conventions://ddd-clean-architecture`
- `conventions://plan-template`
- `conventions://container-first`
- `conventions://component/{name}`

Tools:

- `get_convention(topic)` — excerpts + `source_path`. Aliases: `make` / `make-targets` / `unified-cli-facade` / `cli-facade` → `makefile`; `container` → `container-first`; `terraform` / `infrastructure` → `iac`. The `makefile` topic is the Unified CLI Facade (`docs/adr/0001-makefile-unified-cli-facade.md`).
- `scaffold_guidance(component_type)` — which template alias to copy (`NESTJS_REST`, `MS_FASTAPI`, …) plus the required Makefile lifecycle. Services keep Docker; `terraform-aws` is host Terraform via Make. `conference-manager` is not a template.
- `compare_gaps(target_repo_manifest)` — missing Makefile/Dockerfile/Make targets for services; IaC packages (`package_kind: iac` or terraform stack) require a Makefile that wraps host Terraform, not a Dockerfile. Conference Manager Django vs FastAPI/NestJS is a documented exception, not a gap.

Reference dataset: `data/reference.yaml` (manual PRs; review quarterly or when a plan adopts a new pattern). Owner: `CODEOWNERS`.

## Feedback loop

`compare_gaps` reports missing or outdated conventions. It never writes files in the target repo or in ADE.

When a gap is real (not a documented exception like Conference Manager's Django stack):

1. Open a **human** pull request against this monorepo.
2. Update the matching source of truth: `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*.mdc`, `agents/shared/context/development-guidance.md`, and/or `data/reference.yaml`.
3. Do not teach the MCP a second copy of the rule. Ingestion re-reads those files on `make sync`.

False positives belong in `data/reference.yaml` under `documented_exceptions`, with a pointer to the rule that accepts them — not as silent skips in consumer repos.

## Use from another repository

Step-by-step consumer guide (clone ADE, build the image, configure the client,
call tools, send gaps back): [docs/KnowledgeMCP.md](../../docs/KnowledgeMCP.md).

## Client stdio

After `make build-dev` and `make install-dependencies`, reuse the same Docker
`command` + `args` in the consumer client. The file path and JSON wrapper are
not interchangeable:

| Client | Project file | Wrapper |
|---|---|---|
| Cursor | `.cursor/mcp.json` | `mcpServers` |
| Antigravity IDE | `.agents/mcp_config.json` | `mcpServers` (same object as Cursor) |
| Visual Studio Code | `.vscode/mcp.json` | `servers` + `"type": "stdio"` |

```json
{
  "mcpServers": {
    "ade-knowledge": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "--platform", "linux/amd64",
        "-e", "ADE_ROOT=/repo",
        "-e", "PYTHONPATH=/app/src",
        "-v", "<absolute-path-to-ade>:/repo:ro",
        "-v", "<absolute-path-to-ade>/tools/knowledge-mcp:/app",
        "-v", "knowledge-mcp-packages:/app/.venv",
        "knowledge-mcp-dev",
        "uv", "run", "python", "-m", "stdio_main"
      ]
    }
  }
}
```

To test from **this** ADE clone, copy `.cursor/mcp.json.example` to
`.cursor/mcp.json` (gitignored) and replace `<ADE_ROOT>`. Steps:
[docs/KnowledgeMCP.md](../../docs/KnowledgeMCP.md) (“Test from this ADE clone”).

For VS Code, put that launch under `servers` and add `"type": "stdio"`. Full
wrappers and user-wide paths: [docs/KnowledgeMCP.md](../../docs/KnowledgeMCP.md).

Match `--platform` with `PLATFORM` in `.env` / `.env.public`. SSE/HTTP is optional
on `http://localhost:8000/mcp` after `make launch` (`url` in Cursor/VS Code,
`serverUrl` in Antigravity).
Healthcheck: `GET /healthcheck/`.

# Knowledge MCP

Runtime MCP server that exposes ADE conventions (`CLAUDE.md`, `AGENTS.md`,
`.cursor/rules/*.mdc`, `development-guidance.md`) to other repos and agents.

This is a **service**, not a bootstrap template. Path alias: `KNOWLEDGE_MCP`
(`tools/knowledge-mcp/`).

## Conventions

Container-first. From this directory:

```bash
make help
```

Use only Make targets. Never run host `python`, `pip`, `poetry`, or `npm`.

| Target | Purpose |
|---|---|
| `make build-dev` | Build the dev image |
| `make install-dependencies` | Install Poetry deps into the volume |
| `make lint` | Black, isort, flake8 inside the container |
| `make unit-tests` | Pytest + coverage (80% minimum) |
| `make launch` / `make launch-local` | HTTP/SSE server on port 8000 |
| `make stop` / `make stop-local` | Stop the local server |
| `make sync` | Rebuild `dist/knowledge.json` (`nx run knowledge-mcp:sync`) |
| `make build-prod` | Production image |
| `make interactive` | Shell inside the container |

`PLATFORM` comes from `.env.public` (default `linux/amd64`). Override in a local `.env`.

## MCP surface (v1)

Resources:

- `conventions://tech-stack`
- `conventions://ddd-clean-architecture`
- `conventions://plan-template`
- `conventions://container-first`
- `conventions://component/{name}`

Tools:

- `get_convention(topic)` — excerpts + `source_path`. Aliases: `makefile`, `make-targets` → `container-first`.
- `scaffold_guidance(component_type)` — which template alias to copy (`NESTJS_REST`, `MS_FASTAPI`, …) plus the required Makefile/Docker lifecycle. `conference-manager` is not a template.
- `compare_gaps(target_repo_manifest)` — missing Makefile/Dockerfile/Make targets, conventional commits, host-runtime Makefiles, and optional IaC. Conference Manager Django vs FastAPI/NestJS is a documented exception, not a gap.

Reference dataset: `data/reference.yaml` (manual PRs; review quarterly or when a plan adopts a new pattern). Owner: `CODEOWNERS`.

## Feedback loop

`compare_gaps` reports missing or outdated conventions. It never writes files in the target repo or in ADE.

When a gap is real (not a documented exception like Conference Manager's Django stack):

1. Open a **human** pull request against this monorepo.
2. Update the matching source of truth: `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*.mdc`, `agents/shared/context/development-guidance.md`, and/or `data/reference.yaml`.
3. Do not teach the MCP a second copy of the rule. Ingestion re-reads those files on `make sync`.

False positives belong in `data/reference.yaml` under `documented_exceptions`, with a pointer to the rule that accepts them — not as silent skips in consumer repos.

## Cursor (stdio)

After `make build-dev` and `make install-dependencies`, point Cursor at:

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
        "poetry", "run", "python", "-m", "stdio_main"
      ]
    }
  }
}
```

SSE/HTTP is optional on `http://localhost:8000/mcp` after `make launch`.
Healthcheck: `GET /healthcheck/`.

# Plan: Knowledge MCP — los consumidores usan la imagen de `make build-prod`

## Contexto

La documentación de uso del Knowledge MCP (`tools/knowledge-mcp/`) indica a los
clientes MCP que arranquen `app-dev-exp/knowledge-mcp-dev:latest` (imagen de
desarrollo), montando el código fuente en `/app`, un volumen
`knowledge-mcp-packages` para `.venv` y ejecutando `uv run python -m stdio_main`.
Eso obliga a los consumidores a correr `make build-dev` + `make install-dependencies`
y acopla su configuración al layout de desarrollo.

`make build-prod` ya genera una imagen autocontenida
`$(PROJECT_NAME)/$(COMPOSE_PROJECT_NAME):latest` → `app-dev-exp/knowledge-mcp:latest`
(stage `prod` del [Dockerfile](tools/knowledge-mcp/Dockerfile)): incluye `.venv`
con dependencias de runtime, `src/`, `data/`, `PYTHONPATH=/app/src` y
`PATH=/app/.venv/bin:$PATH`. **No incluye `uv`** ni `dist/`.

Objetivo: toda configuración de cliente documentada (ejemplos y guías) usa la
imagen de prod, y la documentación establece que **los proyectos que consuman
este MCP deben usar la imagen de prod**; la imagen dev queda solo para
mantenedores (lint, tests, `make launch`, `make sync`).

## Bloque de lanzamiento nuevo (patrón único)

Cambios respecto al bloque actual:

| Antes (dev) | Después (prod) | Motivo |
|---|---|---|
| `-v <ADE_ROOT>/tools/knowledge-mcp:/app` | eliminado | Sobrescribiría `/app/.venv` y `/app/src` de la imagen |
| `-v knowledge-mcp-packages:/app/.venv` | eliminado | La imagen ya trae `.venv` |
| `-e PYTHONPATH=/app/src` | eliminado | Ya definido en la imagen (opcional mantenerlo; se elimina para simplificar) |
| `app-dev-exp/knowledge-mcp-dev:latest` | `app-dev-exp/knowledge-mcp:latest` | Imagen de `make build-prod` |
| `uv run python -m stdio_main` | `python -m stdio_main` | Prod no tiene `uv`; `python` resuelve al `.venv` por `PATH` |

Se mantienen: `run -i --rm`, `--platform linux/amd64`, `-e ADE_ROOT=/repo`,
`-v <ADE_ROOT>:/repo:ro`. Sin `dist/knowledge.json` en la imagen,
[bootstrap.py](tools/knowledge-mcp/src/knowledge/bootstrap.py) ingesta en vivo
desde `ADE_ROOT` al arrancar (siempre refleja el clone actual; `make sync` deja de
ser requisito para consumidores).

```json
"args": [
  "run", "-i", "--rm",
  "--platform", "linux/amd64",
  "-e", "ADE_ROOT=/repo",
  "-v", "<ADE_ROOT>:/repo:ro",
  "app-dev-exp/knowledge-mcp:latest",
  "python", "-m", "stdio_main"
]
```

(En los archivos que usan un arg por línea, se conserva ese formato.)

## Tareas

### 0. Rama y plan
- Crear rama desde `main`: `knowledge-mcp/jose/docs/use-prod-image-in-mcp-clients`
  ([docs/standards/branching.md](docs/standards/branching.md)).
- Copiar este plan a `docs/plans/Claude_Code_20261112-knowledge-mcp-prod-image-clients.md`
  (se enlaza en el PR).

### 1. Ejemplos de configuración
- [.mcp.json.example](.mcp.json.example): reemplazar `args` por el bloque prod.
- [.cursor/mcp.json.example](.cursor/mcp.json.example): mismo cambio (hoy es idéntico
  a `.mcp.json.example`; dejarlo con la imagen dev rompería la consistencia).

### 2. [docs/KnowledgeMCP.md](docs/KnowledgeMCP.md)
- **Step 3 — Build the MCP image once**: el paso del consumidor pasa a ser
  `make build-prod` (sin `build-dev` / `install-dependencies`). Añadir nota
  explícita: *"Consumer projects must use the production image
  (`app-dev-exp/knowledge-mcp:latest`, built by `make build-prod`). The `-dev`
  image is for ADE maintainers only."* Indicar que hay que re-ejecutar
  `make build-prod` tras actualizar el clone de ADE si cambió código del MCP.
  Mover `make lint` / `make unit-tests` / `make sync` a un sub-apartado
  "Maintainers" (requieren `build-dev`).
- **Step 4** (Cursor, Antigravity, VS Code): sustituir los tres bloques JSON por el
  bloque prod. "Replace **both** `<ADE_ROOT>`" → "Replace `<ADE_ROOT>`" (ahora
  aparece una sola vez).
- **Test from this ADE clone**: paso 1 → `make build-prod`; enlazar al ejemplo
  actualizado; mencionar también `.mcp.json.example` para Claude Code.
- **Step 5 troubleshooting**: `docker images` debe listar
  `app-dev-exp/knowledge-mcp:latest`; fila "Empty conventions" → verificar
  `<ADE_ROOT>/CLAUDE.md` (ya no depende de `make sync`). Eliminar la fila de
  errores de volumen de paquetes si queda obsoleta.
- La sección HTTP/SSE (`make launch`, usa dev) se deja igual pero se aclara que es
  flujo de mantenedor.

### 3. [tools/knowledge-mcp/README.md](tools/knowledge-mcp/README.md)
- **Client stdio**: "After `make build-dev` and `make install-dependencies`" →
  "After `make build-prod`"; reemplazar el JSON por el bloque prod; añadir la
  regla: consumidores usan la imagen prod; dev solo para desarrollo del MCP.
- Tabla de targets: descripción de `make build-prod` →
  "Production image (`app-dev-exp/knowledge-mcp:latest`) — the one MCP clients run".
- Sección "Stdio / MCP clients" de variables: quitar `PYTHONPATH` e `INDEX_PATH`
  del ejemplo `-e` (solo `ADE_ROOT=/repo`), con nota de que la imagen prod ingesta
  en vivo.

### 4. Barrido de referencias
- `grep -rn "knowledge-mcp-dev\|knowledge-mcp-packages\|uv\", \"run\"" .mcp.json.example .cursor docs tools/knowledge-mcp/README.md agents`
  debe quedar sin referencias de cliente a la imagen dev (las de Makefile/README
  de variables para mantenedores se conservan).
- No se modifica el Makefile, Dockerfile ni CI (ya construye prod en
  [pull_request_knowledge_mcp.yml](.github/workflows/pull_request_knowledge_mcp.yml)).

## Verificación

Desde `tools/knowledge-mcp/` (solo Make, sin host `python`/`uv`):

1. `make build-prod` → `docker images app-dev-exp/knowledge-mcp` muestra `latest`.
2. Regresión del paquete: `make build-dev && make install-dependencies && make lint && make unit-tests`
   (no hay cambios de código, pero confirma que nada se rompió).
3. Smoke test stdio con la imagen prod (handshake MCP real), desde la raíz del repo:
   ```bash
   printf '%s\n' \
     '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"0"}}}' \
     '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
     '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
     '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_convention","arguments":{"topic":"container-first"}}}' \
   | docker run -i --rm --platform linux/amd64 -e ADE_ROOT=/repo \
       -v "$PWD":/repo:ro app-dev-exp/knowledge-mcp:latest python -m stdio_main
   ```
   Esperado: respuesta `initialize`, `tools/list` con `get_convention`,
   `scaffold_guidance`, `compare_gaps`, y `get_convention` con excerpts +
   `source_path`.
4. Validar JSON de ejemplos: `jq . .mcp.json.example .cursor/mcp.json.example`.
5. Prueba en cliente real: copiar `.mcp.json.example` → `.mcp.json` (gitignored),
   reemplazar `<ADE_ROOT>`, recargar MCP en Claude Code (`/mcp`), confirmar
   `ade-knowledge` conectado y ejecutar `get_convention("makefile")` y
   `get_convention("iac")`. Repetir con `.cursor/mcp.json` en Cursor si está
   disponible.
6. Barrido del paso 4 sin resultados indebidos; revisar render de los Markdown.

## Pull request (tarea final)

1. Commit (Conventional Commits, ver [docs/standards/commit-types.md](docs/standards/commit-types.md)):
   `docs(knowledge-mcp): use the build-prod image in MCP client configs`
   incluyendo `.mcp.json.example`, `.cursor/mcp.json.example`,
   `docs/KnowledgeMCP.md`, `tools/knowledge-mcp/README.md` y el plan en `docs/plans/`.
   No incluir los archivos untracked ajenos (`docs/analysis/`, otros planes, `ruleset.json`).
2. `git push -u origin <rama>` (nunca a `main`).
3. `gh pr create --base main` con el cuerpo construido desde
   [.github/pull_request_template.md](.github/pull_request_template.md), todos los
   encabezados en orden:
   - Project or Area: `[x] Knowledge MCP (knowledge-mcp)`.
   - Issue ticket: enlace al plan en `docs/plans/`.
   - Checklist: `[x]` self-review.
   - Tipo: `[x] :pencil: Documentation content changes` y
     `[x] :wrench: Add or update configuration files`.
   - Current module: clientes usan `knowledge-mcp-dev` con montajes de código y `uv run`.
   - New behavior: clientes usan `app-dev-exp/knowledge-mcp:latest` de `make build-prod`,
     sin montajes de código; consumidores deben usar la imagen prod.
   - Breaking change: `[x] Yes` — configuraciones locales existentes deben
     actualizarse y ejecutar `make build-prod`.
   - Sin atribución de herramientas IA en el cuerpo (regla de CLAUDE.md y
     `docs/standards/pull-requests.md`).
4. Confirmar que el job `pr-gate-knowledge-mcp` pasa.

# ade-core

The ADE core engine. It is a Python package, not a bootstrap template, and it
is never copied into other repositories. Every driver calls it:

- the `appdevexp` CLI (`cli/`) embeds it in its binary;
- `tools/knowledge-mcp` is an adapter over its knowledge domain;
- ADE CI uses it to validate manifests and publish the artifacts index.

| Module | Role |
|---|---|
| `domain/manifest.py`, `application/render.py`, `adapters/transforms/` | `template.yaml` model and the deterministic render engine (Phase 1) |
| `domain/versions.py`, `domain/index.py` | Version specifiers (`latest`, `0.3.0`, `^0.3`, `~0.3.1`) and the `artifacts-index.json` model |
| `adapters/sources/github.py`, `adapters/sources/local.py` | `ArtifactSource` adapters (`ports.py`): released bundles from GitHub, or `path:<dir>` |
| `adapters/inspector.py` | `ProjectInspector`: nx layout, `.env` values and used `HTTP_PORT`s of the target repo |
| `application/scaffold.py`, `domain/receipt.py` | `plan_scaffold` / `apply_scaffold` and the `.ade/answers.yaml` receipt |
| `application/index_builder.py` | Builds `artifacts-index.json` from gathered release data (CI) |
| `knowledge/` | Convention ingestion, catalog, `scaffold_guidance`, `compare_gaps`, and their data (`knowledge/data/*.yaml`). It moved here from `tools/knowledge-mcp` in Phase 2 |

Roadmap: [scaffolding platform §8](../../docs/analysis/ade-scaffolding-and-knowledge-platform.md#8-migration-roadmap).
Phase 1 shipped the manifests and the render engine; Phase 2 added the
knowledge domain, sources, plan/apply and the index.

Consumers depend on this package as a **uv path dependency**:
`ade-core = { path = "../tools/ade-core" }` in `cli/`, and `../ade-core` in
`tools/knowledge-mcp/`. Their Makefiles mount this directory for development
and pass it as the named build context `ade-core` to image builds. Keep
`pyproject.toml` and `src/` self-contained, because those are the only
paths the images copy.

## Usage

Use Make targets only. Everything runs in the container, and the repository
is mounted read-only at `/repo`.

```bash
cd tools/ade-core
make build-dev && make install-dependencies
make lint && make unit-tests          # 80% coverage minimum
make validate-manifests               # render every combination of every backend manifest
make combinations PACKAGES="tpl-nestjs-rest"   # GitHub Actions matrix JSON
make render TEMPLATE=nestjs-rest-tpl NAME=orders-api \
  FEATURES="feature_flags=none database=postgres" OUT_DIR=/tmp/orders-api
```

`make render` writes into `OUT_DIR`, which must be empty or missing, as your
own user. It then prints the next Make targets to run inside the new project.

```bash
# Build artifacts-index.json from gathered release data (what release.yml does)
make build-index RELEASES_DIR=/abs/releases INDEX_OUT=/abs/out/artifacts-index.json
```

`RELEASES_DIR` holds one folder per release tag, and each folder contains:
- `template.yaml`, from `git show <tag>:backend/<tpl>/template.yaml`;
- `<tag>.tar.gz.sha256`, from `gh release download <tag> -p '*.tar.gz.sha256'`.

Tags without a manifest (released before Phase 1) are skipped.

## Artifacts index and sources

- **Where the index lives.** `release.yml` (job `publish-artifacts-index`)
  uploads `artifacts-index.json` to the rolling `index` release after every
  template release.
- **How `GitHubReleaseSource` uses it:**
  - it reads the index through a plain asset download, so the REST API rate
    limit does not apply, and caches it for 24h;
  - when offline, it falls back to the stale cached index;
  - it downloads each bundle once, checks it against the index `sha256`, and
    extracts it with tarfile's `data` filter;
  - it rejects a version whose `min_engine_version` is newer than this
    package.
- **Cache location:** `${XDG_CACHE_HOME:-~/.cache}/appdevexp`.
- **`GITHUB_TOKEN`** is sent when it is set, for private mirrors.

`plan_scaffold` renders into a private staging directory, so a plan, including
`--dry-run`, never writes to the target. `apply_scaffold` refuses a
non-empty destination, confines writes to the target root, and upserts
`.ade/answers.yaml` (`ade_receipt: 1`).

Parameter precedence: explicit values > answers file > detected from the
target repo > manifest defaults. Detected values outside a parameter's
`enum` are ignored with a warning. A default `http_port` already used by a
sibling service moves to the next free port.

## Manifest (`backend/<tpl>/template.yaml`, `manifest_schema: 1`)

| Key | Meaning |
|---|---|
| `identity` | `token` (the template name) is replaced by the `name` parameter in every listed file. Lockfiles are listed too: they are kept, because the Dockerfiles run `npm ci` / `uv sync --frozen` |
| `exclude` | Never copied. `template.yaml`, `.git/` and `.env` are always excluded. `dir/` matches that directory at any depth |
| `parameters` | JSON Schema. Defaults may use `{{ other_param }}` placeholders |
| `features.<name>` | `values`, `default`, and `when.<value>` transforms: `remove_files`, `remove_env` (`.env.public`), `remove_make_targets`, `remove_lines` (regex), `replace` (literal) |
| `edits` | `dotenv_set` (keeps the `.env.public` layout) and `json_set` (dotted paths, `*` wildcard) |
| `next_steps` | Make targets to run in the rendered project |

Rendering order: copy → feature transforms (written against the template's
original text) → identity rename → edits.

**Every transform must match.** If a file, env key, Make target, regex or
literal is missing, the render fails with the manifest entry that drifted.
When you move or rename a template file that a manifest references, update
`template.yaml` in the same PR. CI (`render-and-verify` in
`.github/workflows/pull_request_backend.yml`) catches anything you miss.

A disabled feature loses its wiring, but its dependencies stay in
`package.json` / `pyproject.toml` and the lockfiles. Pruning dependencies
needs the lockfile to be regenerated. That work was deferred from Phase 2 to
Phase 5 (lifecycle), together with `update`.

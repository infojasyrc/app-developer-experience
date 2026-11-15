# ade-core

The ADE core engine. It reads a template's `template.yaml` manifest and
renders the template into a new project deterministically: it renames the
template and strips the optional features you turn off. This is not a
bootstrap template, and it is not copied into other repositories.

Phase 1 of the
[scaffolding platform roadmap](../../docs/analysis/ade-scaffolding-and-knowledge-platform.md#8-migration-roadmap)
ships the manifest model, the render engine and the CI check that renders
every feature combination. `appdevexp new` (Phase 2) will build on this
package.

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
needs the lockfile to be regenerated, which is planned for Phase 2.

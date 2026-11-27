# Monorepo CLI (`appdevexp`)

`appdevexp` scaffolds new projects from released ADE templates. It also handles
conventional commits and repository state.

Scaffolding (`new`, `list`) is the ADE distribution channel for **other
repositories**; the end-to-end guide is [docs/AdoptingADE.md](../docs/AdoptingADE.md).
All scaffolding logic lives in [`tools/ade-core`](../tools/ade-core/README.md),
which is embedded in the binary. The CLI only adds prompts and output.

---

## Scaffolding commands

| Command | What it does |
|---|---|
| `appdevexp list` | Templates in the artifacts index with their released versions |
| `appdevexp new service` | Plan → confirm → write a backend service and record it in `.ade/answers.yaml` |
| `appdevexp --version` | CLI version and embedded `ade-core` engine version |

`appdevexp new service` options:

| Option | Meaning |
|---|---|
| `-t, --template NAME[@SPEC]` | `fastapi-rest`, `nestjs-rest`, `nestjs-gql`; SPEC is `latest` (default), `0.3.0`, `^0.3` or `~0.3.1` |
| `-n, --name` | Service name (kebab-case) |
| `-f, --feature KEY=VALUE` | Feature value, repeatable (`database=none`, `feature_flags=none`, `auth=none`) |
| `-p, --param KEY=VALUE` | Template parameter, repeatable (`http_port=4100`, `project_name=acme`) |
| `-o, --output-dir` | Destination relative to `--target`; default `backend/<name>` when `nx.json` exists, else `<name>` |
| `--target` | Repository root (default `.`) |
| `--answers FILE` | YAML with `template`, `parameters`, `features` (precedence: flags > answers > detected > defaults) |
| `--source` | `github` (released bundles, default) or `path:<template dir>` (unreleased working copy) |
| `--registry`, `--index-url`, `--refresh` | Fork or mirror, index override (`https://` or `file://`), skip the 24h index cache |
| `--dry-run` | Show the plan, write nothing |
| `-y, --yes` | Apply without prompting (required without a terminal) |
| `--format json` | Machine-readable plan and result |

Without a terminal, every missing input is an error, so scripts never hang.
The CLI never runs installs. It prints the template's Make targets as next
steps.

From an ADE clone, run the binary in its container against any repository:

```bash
make create-volumes && make build-prod     # once
make scaffold TARGET_DIR=/abs/path/to/repo ARGS="new service -t nestjs-rest -n orders-api --dry-run"
make list-artifacts
```

`scaffold` runs as your uid/gid and mounts `TARGET_DIR` at `/work`. It caches
bundles in `~/.cache/appdevexp` and forwards `GITHUB_TOKEN` and
`APPDEVEXP_INDEX_URL` when they are set.

---

## Architecture & Stack

- **Runtime**: Python 3.13 (same as `tools/ade-core`, a uv path dependency)
- **Package & Dependency Manager**: [`uv`](https://docs.astral.sh/uv/) (`pyproject.toml` and `uv.lock`)
- **CLI Framework**: [`click`](https://click.palletsprojects.com/)
- **Interactive Prompts**: [`inquirer`](https://python-inquirer.readthedocs.io/)
- **Git Integration**: [`GitPython`](https://gitpython.readthedocs.io/)
- **Packaging**: [`PyInstaller`](https://pyinstaller.org/) (`appdevexp` single binary)
- **Container Architecture**: Multi-stage Docker build (`dev`, `build`, `prod`) based on Astral `uv` images

---

## Unified CLI Facade (Makefile)

Per [`docs/adr/0001-makefile-unified-cli-facade.md`](../docs/adr/0001-makefile-unified-cli-facade.md), all CLI workflows run container-first through `make`. Never run host `python`, `pip`, or `uv` directly.

| Target | Description |
|---|---|
| `make help` | Display all available targets with descriptions |
| `make create-volumes` | Create named container volumes (`app-dev-xp-cli-packages`) — **run before first use** |
| `make build-dev` | Build the local development Docker image |
| `make build-prod` | Build the production Docker image containing the compiled binary |
| `make install-dependencies` | Install packages from `pyproject.toml` / `uv.lock` into the container volume |
| `make run-unit-tests` | Run pytest unit tests inside the container |
| `make cli` | Run the CLI interactive entrypoint |
| `make basic-commit m="..."` | Execute conventional commit with specified message |
| `make interactive-commit` | Launch interactive wizard for conventional commit creation |
| `make build-local-package` | Build standalone executable (`dist/appdevexp`) using PyInstaller |
| `make scaffold TARGET_DIR=… ARGS="…"` | Run the `appdevexp` binary (prod image) against a repository |
| `make list-artifacts` | `appdevexp list` through the prod image |
| `make docker-clean` | Stop running containers and prune unused images |
| `make interactive` | Open an interactive shell inside the container with virtual environment activated |

---

## Quickstart

```bash
# 1. Initialize container volume
make create-volumes

# 2. Build development container
make build-dev

# 3. Install dependencies using uv
make install-dependencies

# 4. Run test suite
make run-unit-tests

# 5. Execute commit commands
make basic-commit m="feat(cli): add new capability"
# or interactive wizard:
make interactive-commit
```

---

## Multiplatform Support

Platform is defined via `PLATFORM` in `.env.public` (default `linux/amd64` for CI/cloud parity). Developers on Apple Silicon may set `PLATFORM=linux/arm64` in a local `.env`.

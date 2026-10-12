# Monorepo CLI (`appdevexp`)

Internal CLI tool to handle conventional commits, repository state, and monorepo developer tooling.

---

## Architecture & Stack

- **Runtime**: Python 3.12
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

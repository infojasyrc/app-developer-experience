# Fastapi Rest Template

This is a template to build rest api using fastapi.

## Content

- [Content](#content)
- [Getting started](#getting-started)

## Getting started

### Requirements

Host tools only: Docker and Make. Never run `python`, `pip`, `uv`, or `poetry` on the host.

```bash
brew install --cask docker-desktop
```

### Local Development

The Makefile is the Unified CLI Facade. It loads `.env` if that file exists, otherwise `.env.public`. Lockfile is `uv.lock` — install only through `make install-dependencies`.

`PLATFORM` comes from `.env.public` (default `linux/amd64`). On Apple Silicon you may set `PLATFORM=linux/arm64` in a local `.env`. Do not use `linux/arm64/v8`.

```bash
make help
make create-volumes         # once (database + packages volumes)
make build-dev
make install-dependencies
make lint
make unit-tests
make launch-local
make stop-local
make build-prod
make interactive
```

## Project structure

```
fastapi-rest-tpl/
├── src/                    # Main application code
│   ├── api/                # API route definitions
│   ├── core/               # Core settings, config, and utilities
│   ├── schemas/            # DTO definitions for responses
│   ├── infrastructure/     # All components to be integrated with the application like database
│   ├── use-cases/          # Use Cases for bussiness logic
│   └── main.py             # FastAPI entrypoint
├── tests/                  # Unit and integration tests
├── Dockerfile              # Docker configuration for deployment
├── Makefile                # Automation commands for development
├── pyproject.toml          # Python dependencies
├── uv.lock                 # Python lock for dependencies
└── README.md               # Project documentation
```

**Description:**

- **src/**: Application source code.
  - **api/**: API endpoints and routes.
  - **core/**: Application configuration, settings, and shared utilities.
  - **schemas/**: DTO definitions for responses.
  - **infrastructure/**: Integrations such as the database.
  - **use-cases/**: Business logic.
  - **main.py**: FastAPI entrypoint.
- **tests/**: Test suite for the application.
- **Dockerfile**: Instructions to build the application container.
- **Makefile**: Unified CLI Facade — build, test, lint, and run only through Make.
- **pyproject.toml** / **uv.lock**: Python dependencies. Install only through `make install-dependencies`.
- **README.md**: Project overview and documentation.

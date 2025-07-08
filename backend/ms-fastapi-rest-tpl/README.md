# Fastapi Rest Template

This is a template to build rest api using fastapi.

## Content

- [Content](#content)
- [Getting started](#getting-started)

## Getting started

### Requirements

Install a container tech: Docker

```bash
brew install --cask docker-desktop
```

### Local Development

```bash
# run all commands available
make
# build dev container for local
make build-dev
# install dependencies
make install-dependencies
# get inside the container
make interactive
# run all unit tests
make run-tests
# launch api using multi containers
make launch-local
# stop containers
make stop-local
```

## Project structure

```
ms-fastapi-rest-tpl/
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
├── poetry.lock             # Python lock for dependencies
└── README.md               # Project documentation
```

**Description:**

- **app/**: Contains all application source code.
  - **api/**: Defines API endpoints and routes.
  - **core/**: Application configuration, settings, and shared utilities.
  - **models/**: Pydantic and ORM models for data validation and persistence.
  - **services/**: Business logic, reusable services, and integrations.
  - **main.py**: Application entrypoint, creates FastAPI app instance.
- **tests/**: Test suite for the application.
- **Dockerfile**: Instructions to build the application container.
- **Makefile**: Common development commands for building, testing, and running the app.
- **requirements.txt**: List of Python dependencies.
- **README.md**: Project overview and documentation.

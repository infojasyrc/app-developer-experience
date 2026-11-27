# syntax=docker/dockerfile:1

# Build with the ADE core engine as a named context (see the Makefile):
#   docker build --build-context ade-core=../tools/ade-core --target prod .

FROM python:3.13-slim AS dev

# Copy uv binary
COPY --from=ghcr.io/astral-sh/uv:0.12.9 /uv /uvx /bin/

# Install system dependencies for git and pyinstaller
RUN apt-get update && apt-get install -y --no-install-recommends \
    binutils \
    git \
    && rm -rf /var/lib/apt/lists/*

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONFAULTHANDLER=1 \
    PYTHONPATH=/app/src \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/app/.venv

WORKDIR /app

FROM dev AS build

WORKDIR /app

COPY pyproject.toml uv.lock ./
# ade-core path dependency (pyproject: ../tools/ade-core)
COPY --from=ade-core pyproject.toml /tools/ade-core/pyproject.toml
COPY --from=ade-core src /tools/ade-core/src

RUN uv sync --frozen --no-dev --no-install-project

FROM build AS prod

WORKDIR /app

COPY src ./src

ENV PATH="/app/.venv/bin:$PATH"

# --collect-data: ade-core ships the knowledge catalog YAML and jsonschema its meta-schemas
RUN uv run pyinstaller --onefile \
    --copy-metadata readchar --copy-metadata inquirer --copy-metadata ade-core \
    --collect-data ade_core --collect-data jsonschema_specifications \
    --name=appdevexp src/main.py \
    && chmod 0755 /app/dist/appdevexp

VOLUME /app/dist

ENTRYPOINT ["/app/dist/appdevexp"]

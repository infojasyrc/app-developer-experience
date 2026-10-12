# syntax=docker/dockerfile:1

FROM python:3.14-slim AS dev

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

RUN uv sync --frozen --no-dev --no-install-project

FROM build AS prod

WORKDIR /app

COPY src ./src

ENV PATH="/app/.venv/bin:$PATH"

RUN uv run pyinstaller --onefile --copy-metadata readchar --copy-metadata inquirer --name=appdevexp src/main.py

VOLUME /app/dist

ENTRYPOINT ["/app/dist/appdevexp"]

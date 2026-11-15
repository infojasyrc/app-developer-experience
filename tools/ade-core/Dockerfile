# syntax=docker/dockerfile:1

FROM python:3.13-alpine AS dev

COPY --from=ghcr.io/astral-sh/uv:0.12.9 /uv /uvx /bin/

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

COPY pyproject.toml /app/pyproject.toml
COPY uv.lock /app/uv.lock

RUN uv sync --frozen --no-dev --no-install-project

FROM python:3.13-alpine AS prod

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app/src \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

COPY --from=build /app/.venv /app/.venv
COPY src /app/src

ENTRYPOINT ["python", "-m", "ade_core"]
CMD ["--help"]

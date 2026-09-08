# syntax=docker/dockerfile:1

FROM python:3.13-alpine AS dev

RUN apk add --no-cache build-base curl

RUN curl -sSL https://install.python-poetry.org | python3 - \
    && ln -s ~/.local/bin/poetry /usr/local/bin/poetry

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONFAULTHANDLER=1 \
    PYTHONPATH=/app/src \
    PIP_NO_CACHE_DIR=true \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1

WORKDIR /app

RUN poetry config virtualenvs.in-project true

FROM dev AS build

WORKDIR /app

COPY pyproject.toml /app/pyproject.toml
COPY poetry.lock /app/poetry.lock

RUN poetry install --no-root --only main

FROM python:3.13-alpine AS prod

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app/src \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

COPY --from=build /app/.venv /app/.venv
COPY src /app/src
COPY data /app/data

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/healthcheck/')"

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# syntax=docker/dockerfile:1

FROM python:3.13-alpine AS dev

# update package registry
RUN apk update --no-check-certificate

# install packages
RUN apk add --no-check-certificate \
    # build-essential equivalent in Alpine
    build-base \
    # python odbc packages
    unixodbc-dev \
    # wait for other containers
    wait4x \
    curl

RUN curl -sSL https://install.python-poetry.org | python3 - \
    && ln -s ~/.local/bin/poetry /usr/local/bin/poetry

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONFAULTHANDLER=1
# set environment variables
ENV PIP_NO_CACHE_DIR=true \
    PIPENV_VENV_IN_PROJECT=1 \
    POETRY_NO_INTERACTION=1

WORKDIR /app

RUN poetry config virtualenvs.in-project true

FROM dev AS build

WORKDIR /app

# copy only lock files to avoid source code
COPY pyproject.toml /app/pyproject.toml
COPY poetry.lock /app/poetry.lock

# install only production dependencies
RUN poetry install --no-root --only main

FROM build AS prod

WORKDIR /app

# copy source code
# copy the virtual environment from build stage
COPY --from=build /app/.venv /app/.venv
# copy source code
COPY . .

# healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# run the application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0. 0.0.0", "--port", "8000"]

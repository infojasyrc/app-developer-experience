FROM python:3.10.13-alpine3.18 AS build

# update package registry
RUN apk update --no-check-certificate && \
    apk upgrade --no-check-certificate && \
    apk add --no-check-certificate --upgrade apk-tools build-base wait4x

# pipenv configuration

# disable pipenv cache
ENV PIP_NO_CACHE_DIR=true
# create or use .venv in pipfile directory
ENV PIPENV_VENV_IN_PROJECT=1
# more detailed logs
ENV PIPENV_VERBOSE=1

# install pipenv and python
RUN pip install --no-cache-dir pipenv==2023.10.24 && \
    pipenv install --python 3.10

FROM build AS dependencies

WORKDIR /app

# copy only lock files to avoid source code
COPY ./Pipfile /app/Pipfile
COPY ./Pipfile.lock /app/Pipfile.lock

# install dependencies
RUN pipenv run pipenv install --deploy --ignore-pipfile && \
    pipenv --clear

FROM dependencies AS prod

WORKDIR /app

COPY ./src /app

COPY --from=dependencies /app/.venv /app/.venv

ENV PATH="/app/.venv/bin:$PATH"
ENV PIPENV_PIPFILE=/app/Pipfile

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD curl -f http://localhost:3000/ || exit 1

CMD [ "pipenv", "run", "python", "manage.py", "runserver", "0.0.0.0:3000" ]
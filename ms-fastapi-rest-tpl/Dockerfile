FROM python:3.10.13-alpine3.18 AS build

# update package registry
RUN apk update --no-check-certificate

# install packages
RUN apk add --no-check-certificate \
    # python odbc packages
    build-base \
    unixodbc-dev \
    # wait for other containers
    wait4x

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

FROM build AS prod

WORKDIR /app

# copy only lock files to avoid source code
COPY ./Pipfile /app/Pipfile
COPY ./Pipfile.lock /app/Pipfile.lock

# install dependencies
RUN pipenv run pipenv install --deploy --ignore-pipfile && \
    pipenv --clear

# copy source code
COPY ./src /app

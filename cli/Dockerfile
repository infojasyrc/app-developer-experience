# Use a minimal Python base image
FROM python:3.11-slim AS build

# disable pipenv cache
ENV PIP_NO_CACHE_DIR=true
# create or use .venv in pipfile directory
ENV PIPENV_VENV_IN_PROJECT=1
# more detailed logs
ENV PIPENV_VERBOSE=1

WORKDIR /app

# install pipenv and python
RUN pip install --no-cache-dir pipenv==2024.4.1 && \
    pipenv install --python 3.11

FROM build AS dependencies

# Set work directory inside the container
WORKDIR /app

# Copy project files
COPY ./src .
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Set the entrypoint to execute the CLI
ENTRYPOINT ["python", "/app/main.py"]

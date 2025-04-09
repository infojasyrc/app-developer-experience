# Use a minimal Python base image
FROM python:3.11-slim AS dev

# Install binutils
RUN apt-get update && apt-get install -y binutils

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

FROM dev AS dependencies

# Set work directory inside the container
WORKDIR /app

# Copy Pipfile and Pipfile.lock
COPY Pipfile Pipfile.lock ./

# Install only production dependencies
RUN pipenv install --deploy --ignore-pipfile

# Copy the rest of the application
COPY ./src .

FROM dependencies AS prod

# Set work directory inside the container
WORKDIR /app

# Copy the virtual environment from the dependencies stage
COPY --from=dependencies /app/.venv /app/.venv

# Copy the rest of the application
COPY ./src .

# Set the PATH to use the virtual environment
ENV PATH="/app/.venv/bin:$PATH"
# Run pyinstaller to create a single executable
RUN pipenv run pyinstaller --onefile --name=appexpdev src/main.py

# Make the dist folder available as a volume
VOLUME /app/dist

# Set the entrypoint to execute the CLI
ENTRYPOINT ["/app/dist/appexpdevcli"]

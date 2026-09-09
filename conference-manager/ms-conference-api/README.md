# Conference Manager API REST

The Event Manager Backend is a RESTful API designed to manage events, including creation, updating,
removal, and listing of events. It utilizes Firebase service for Authentication.

## Contents

- [Conference Manager API REST](#conference-manager-api-rest)
- [Contents](#contents)
- [Dependencies](#dependencies)
- [Folder structure](#folder-structure)
- [Local Development](#local-development)
  - [Environment Configuration](#environment-configuration)
  - [Launch application using containers](#launch-application-using-containers)
  - [Launch application standalone](./docs/development/Local_Development.md)
- [Team Standards](#team-standards)
- [Authentication](#authentication)
- [Features](#features)
  - [Examples of available endpoints](#examples-of-available-endpoints)
  - [Local services](#local-services)
  - [Troubleshooting](#troubleshooting)

## Dependencies

For this application, we are using Node.js v20. (You will check .nvmrc file)

For MacOS:

```bash
brew install nvm docker
nvm install v20
```

We are using docker to manage containers

## Folder structure

The main logic of the application is inside `src` folder, and it contains the following:

`services`: This folder will group all business logic
`models`: This folder will group all entities to mapped for endpoints and database
`controllers`: This folder will group all endpoints available for the application
`providers`: this folder group all data providers for the application. In this case: firebase and mongo
`services-config`: this folder have the api keys for firebase

Additionally, we have:

`docs`: All documentation related to the project
`tests`: this folder group all unit tests
`scripts`: this folder will handle different scripts for simulate authentication or populate database with dummy data
`.github`: this folder will handle pipelines for CI/CD

## Team Standards

This service follows the ADE-wide team standards instead of its own copy:

- [Commit types](../../docs/standards/commit-types.md)
- [Branch naming](../../docs/standards/branching.md)
- [Pull request process](../../docs/standards/pull-requests.md)

## Local Development

For local development, follow these steps:

### Environment Configuration

Copy the `.env.public` file and rename it as `.env`. Then, configure the environment variables according to your specific environment:

| Key                          | Description                                                                     |
| :--------------------------- | :------------------------------------------------------------------------------ |
| **DB_HOST**                  | Required. Hostname for the Database Engine.                                     |
| **DB_PORT**                  | Required. Port to reach Database Engine.                                        |
| **DB_ROOT_USERNAME**         | Required. ROOT User name credential for Database Engine.                        |
| **DB_ROOT_PASSWORD**         | Required. ROOT User password credential for Database Engine.                    |
| **DEFAULT_DB**               | Required. Default Database Name.                                                |
| **AUTH_URI**                 | Required. URI to authentication identity provider.                              |
| **TOKEN_URI**                | Required. URI to authentication token provider.                                 |
| **AUTH_PROVIDER_CERT_URL**   | Required. Cert provider URL for Authentication identification.                  |
| **AUTH_PRIVATE_KEY_ID**      | Required. Authentication ID according to GService.                              |
| **AUTH_PRIVATE_KEY**         | Required. Authentication Unique identifier for GService.                        |
| **AUTH_CLIENT_EMAIL**        | Required. Authentication project email for GService.                            |
| **AUTH_CLIENT_ID**           | Required. Authentication identifier for client connection.                      |
| **AUTH_CLIENT_CERT_URL**     | Required. Cert URL for project Authentication identification.                   |
| **AUTH_API_KEY**             | Required. Authorization API Identifier.                                         |
| **AUTH_DOMAIN**              | Required. App Domain for the project.                                           |
| **AUTH_PROJECT_ID**          | Required. Project Identifier in GService.                                       |
| **AUTH_STORAGE_BUCKET**      | Required. Storage URN for project GService.                                     |
| **AUTH_MESSAGING_SENDER_ID** | Required. Firebase Cloud Messaging Identifier.                                  |
| **AUTH_APP_ID**              | Required. App identifier to communicate with Firebase assistance service.       |
| **AUTH_MEASUREMENT_ID**      | Required. Analytics SDK Identifier for Firebase App.                            |
| **PRIVATE_KEY_V2**           | Required. Authorization key for Firebase when authenticating users              |
| **PRIVATE_KEY_ADMIN_V2**     | Required. Private key for firebase v2 upload images                             |
| **SWAGGER_DOCS_TITLE**       | Swagger Open Api Documentationn Title . Defatult value 'Chupitos V2 API'        |
| **SWAGGER_DOCS_DESCRIPTION** | Swagger Open Api Documentationn Description. Defatult value 'API documentation' |
| **SWAGGER_DOCS_VERSION**     | Swagger Open Api Documentationn Version v2. Defatult value 1.0                  |
| **SWAGGER_DOCS_PATH**        | Swagger Open Api Documentationn Path, Defatult value /swagger                   |

The current values for DB_ROOT_USERNAME, DB_ROOT_PASSWORD, DEFAULT_DB as just for guidance.

Note: Be careful with DB_HOST, because according the way of launching the application, You will need a different value according to the host of the database.

Examples of the database url for connection:


| Execution     | Host      | Value     |
| :------------ | :-------- | :-------- |
| Without containers | localhost | mongodb://mongoDev:Passw0rd@localhost:27017/?authSource=admin |
| Using containers   | mongodb   | mongodb://mongoDev:Passw0rd@mongodb:27017/?authSource=admin   |

### Launch application using containers

Use the following command:

```bash
# build container for development
make build-dev
# install dependencies
make install-dependencies
# launch service in development mode
make launch-local-dev
# run unit tests
make unit-tests
# stop all services
make stop-local-dev
```

To simulate production environment, use:

```bash
make launch-prod
```

### Authentication

Authentication is controlled by an Unleash feature flag.

- Set the following environment variables to configure Unleash:

```
UNLEASH_URL=http://localhost:4242/api
UNLEASH_API_KEY=your-unleash-api-key
UNLEASH_APP_NAME=ms-conference-api
UNLEASH_TOGGLE_AUTH=auth.firebase.enabled
```

- When the toggle `UNLEASH_TOGGLE_AUTH` (default `auth.firebase.enabled`) is disabled in Unleash, Firebase authentication is bypassed and Firebase Admin SDK is not initialized.
- When enabled, Firebase authentication remains active. See [docs/FIREBASE.md](./docs/FIREBASE.md) for setup.

## Features

### Examples of available endpoints

Public endpoints:

```
- get http://localhost:5002/v1/healthcheck
- get http://localhost:5002/v1/events
```

Private endpoints: Authorization header with a valid token is required to get a response for these endpoints.

```
- get http://localhost:5001/v1/users
- get http://localhost:5001/v1/users/:id
- post http://localhost:5001/v1/users/
- put http://localhost:5001/v1/users/:id
- delete http://localhost:5001/v1/users/:id
```

### Local services

`make launch-local-dev` starts the full development stack. Host ports below match the defaults in `.env.public` (`MS_PORT` for the API, `UNLEASH_DB_PORT` for the Unleash SSO gateway).

| Service | Port | Description |
| :------ | :--- | :---------- |
| **api** | 5002 | Conference Manager REST API in development mode. |
| **mongodb** | 27017 | MongoDB for events, users, and related data. |
| **unleash-app** | 4242 | Unleash feature-toggle server (internal only; reached through oauth2-proxy SSO gateway). |
| **unleash-db** | 5433 | PostgreSQL database used by Unleash. |
| **keycloak** | 8080 | Keycloak identity provider (SSO for Grafana and Unleash). |
| **ob-prometheus** | 9090 | Prometheus metrics scraper and store. |
| **ob-grafana** | 3000 | Grafana dashboards, authenticated via Keycloak SSO. |

### Troubleshooting

Collection in Mongo are not created:

There is a possible error when collections are not created in mongo, so, you need to remove the volumen of the application for the database, stop the database service and start the command again.

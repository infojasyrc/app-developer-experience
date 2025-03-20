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
  - [Launch application standalone](#launch-application-standalone)
    - [Database](#database)
    - [API](#api)
    - [Debugging](#debugging)
    - [Run unit tests](#run-unit-tests)
  - [Launch application using containers](#launch-application-using-containers)
- [Proposals Type Commits](#proposals-type-commits)
- [Authentication](#authentication)
- [Features](#features)
  - [Examples of available endpoints](#examples-of-available-endpoints)

## Dependencies

For this application, we are using Node.js v18. (You will check .nvmrc file)

For MacOS:

```bash
brew install nvm docker
nvm install v18
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

### Launch application standalone

This way of development requires to launch each component individually: API and DATABASE

#### Database

To store and retrieve event information, ensure that the database is up and running. You can launch ONLY the database with the following command:

```bash
make launch-db
```

This command will initialize a service for the database, load collections, and preload admin and user credentials for testing purposes. Remember to customize the configurations based on your environment:

#### API

Ensure you have the required Node.js version installed according the dependencies. If not, you can set it up using Node Version Manager [NVM](https://github.com/nvm-sh/nvm), which should already be installed and configure it.
To select the appropriate Node.js version, use the following command:

```bash
nvm use
```

Then, install project dependencies with:

```bash
yarn install
```

- If you prefer to run the application with auto-reloading during development, use the following command:

```bash
yarn dev
```

- If you prefer not to auto-reload on each change and run the application, use the following command:

```bash
yarn start
```

These steps will help you set up your local development environment for the Event Manager Backend.

#### Debugging

This way of execution allows you debugging the applciation using Visual Studio Code.
On MacOS, if you use nvm within a specific version,
please add the following in launch.json:

```bash
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/index.js",
      "runtimeExecutable": "${env:HOME}/.nvm/versions/node/{Specific version}/bin/node"
    }
  ]
}
```

#### Run unit tests

You can run unit tests using the following command:

```bash
yarn test:ci
```

### Launch application using containers

Use the following command:

```bash
make build-dev
make install-packages
make launch-local
```

To simulate production environment, use:

```bash
make launch-prod
```

### Proposals Type Commits

- `feat`: Introduces a new feature to the codebase (this correlates with MINOR in [SemVer](https://semver.org/)).

  `feat: add new implementation to Xyz`

- `fix`: Patches a bug in the codebase (this correlates with PATCH in [SemVer](https://semver.org/)).

  `fix: change constant value CONSTANT_XYZ in Xyz class`

- `build`: Changes that affect the build system or dependencies (npm, gradle, etc)

  `build: change database driver version`

- `ci`: Continuous Integration configuration changes in files/scripts (GitLab CI, GitHub Actions)

  `ci: change config in .circleci adding a code-lint job`

- `docs`: Documentation files changes (Readme.md)

  `docs: change Readme.md adding info to local deploy`

- `perf`: Improves the performance

  `perf: delete boilerplate implementation in Xyz`

- `refactor`: Code that neither fixes a bug/feature

  `refactor: delete boilerplate implementation in Xyz`

- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)

  `style: change the tabulation format in Xyz`

- `test`: Adding missing tests or correcting existing ones

  `test: add missing test to Xyz implementation`

- `chore`: Other changes that don't modify src or test files

  `chore: ignore X file in .gitignore`

- `revert`: Reverts a previous commit

  `revert: reverts a1s2d3f4g5 commit`

- `wip`: Changes to commit that haven't yet finished

  `wip: Xyz class refactor`

### Authentication

This project is using Firebase Authentication.
All details [here](./docs/FIREBASE.md) in this section

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

### Troubleshooting

Collection in Mongo are not created:

There is a possible error when collections are not created in mongo, so, you need to remove the volumen of the application for the database, stop the database service and start the command again.

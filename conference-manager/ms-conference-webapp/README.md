# Event Manager Webapp

The Event Manager Frontend is a web application built with React designed to efficiently manage events. It provides essential features such as event creation, updating, removal, and event listing

## Contents

- [Event Manager Webapp](#event-manager-webapp)
- [Contents](#contents)
- [Dependencies](#dependencies)
- [Getting started](#getting-started)
- [Local Development](#local-development)
- [Folder structure](#folder-structure)
- [Testing](#testing)
- [Docker Integraton](#docker-integration)
- [Resources](#resources)

## Dependencies

For this application, we are using Node.js v16. (You will check .nvmrc file)

For MacOS:

```bash
brew install nvm
nvm install v16
```

> :bulb: **Tip:** If nvm isn't functioning correctly after installation, consider run the line ```source ~/.nvm/nvm.sh```. This ensures that nvm is properly initialized and integrated into your shell session.

## Getting started

### Local Development

For local development, follow these steps:

1. **Environment Configuration**

  Copy the `.env.public` file and rename it as `.env`. Then, configure the environment variables according to your specific environment:

| Key                       | Description                                               |
| :-------------------------| :-------------------------------------------------------- |
| **REACT_APP_BASE_PATH**   | Local URL for the app                                     |
| **REACT_APP_VERSION**     | App version                                               |
| **REACT_APP_API_KEY**     | API Identifier.                                           |
| **REACT_APP_AUTH_DOMAIN** | App Domain for the project.                               |
| **REACT_APP_DATABASE_URL**        | URL to Firebase GService Database.                |
| **REACT_APP_PROJECT_ID**  | Project Identifier in GService.                           |
| **REACT_APP_STORAGE_BUCKET**      | Storage URN for project GService.                 |
| **REACT_APP_MESSAGING_SENDER_ID** | Firebase Cloud Messaging Identifier.              |
| **REACT_APP_FIREBASE_APP_ID** | Firebase APP Identifier.              |
| **REACT_APP_MEASUREMENT_ID** | Firebase Measurement Identifier.              |

**NOTE:**   Ensure that you have followed the necessary steps on the backend to have the required services up and running for managing, storing, and retrieving data for the app.

2. **Installation:**

Ensure you have the required Node.js version installed. If not, you can set it up using Node Version Manager (NVM), which should already be installed.
To select the appropriate Node.js version, use the following command:

```bash
nvm use v16
```

Then, install project dependencies with:

```bash
npm install
```

3. **Run the application**

- To run the application, use the following command:

```bash
npm start
```

These steps will help you set up your local development environment for the Event Manager Frontend.

## Folder structure

`api`: This folder groups HTTP requests to the backend API   
`components`: This folder will group all the required UI components   
`contexts`: This folder groups all contexts used in the UI   
`database`: This folder groups all data configuration and operations for managing data, specifically within an IndexedDB database   
`pages`: This folder groups all React components required for the UI   
`providers`: This folder groups all React components that serve as context providers   
`styles`: This folder groups all styles required for the UI.   

## Testing:

You can run tests for the application using the following command:

```bash
npm run test:ci
```

## Docker Integration

**Dockerfile:** Configuration file that specifies the environment setup, dependencies installation, and prepares the application for execution within a Docker container.

**Make command:** To facilitate the Docker image creation process, a make command is  defined in the `Makefile`.
To create a Docker image of the frontend, please execute:

  ```bash
make build
  ```

## Resources

[React Testing Library - Common mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
[How to test a select with React Testing Library](https://cathalmacdonnacha.com/how-to-test-a-select-element-with-react-testing-library)

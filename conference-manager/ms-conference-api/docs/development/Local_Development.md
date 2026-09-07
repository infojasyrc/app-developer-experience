# Launch application standalone

This way of development requires to launch each component individually: API and DATABASE

## Database

To store and retrieve event information, ensure that the database is up and running. You can launch ONLY the database with the following command:

```bash
make launch-db
```

This command will initialize a service for the database, load collections, and preload admin and user credentials for testing purposes. Remember to customize the configurations based on your environment:

## API

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

## Debugging

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

## Run unit tests

```bash
yarn test:unit-tests
```
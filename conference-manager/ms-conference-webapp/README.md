# Conference Manager Webapp

This is a web application using nextjs to show all information for conferences

## Getting Started

First, run the development server:

```bash
# build the container
make build-dev-webapp
# install all dependencies
make install-dependencies-webapp
# launch the application
make launch-webapp-dev
```

Stop the execution and remove stopped containers

```bash
# stop the execution
make stop-webapp-dev
```

## Team Standards

This service follows the ADE-wide team standards:

- [Commit types](../../docs/standards/commit-types.md)
- [Branch naming](../../docs/standards/branching.md)
- [Pull request process](../../docs/standards/pull-requests.md)

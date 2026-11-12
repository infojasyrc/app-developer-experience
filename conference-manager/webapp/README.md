# Conference Manager Webapp

This is a web application using nextjs to show all information for conferences

## Getting Started

First, run the development server (Next.js only, port 8090):

```bash
# build the container
make build-dev
# install all dependencies
make install-dependencies
# launch the application
make launch
```

Stop the execution:

```bash
make stop
```

### Full local stack (webapp + storybook + API + Unleash + shared DB)

The compose file for the webapp lives in
[`docker-compose/docker-compose.local.dev.web.yml`](docker-compose/docker-compose.local.dev.web.yml).
It depends on the API compose files in [`../backend/docker-compose/`](../backend/docker-compose/),
so build the API image and create its volumes first:

```bash
make -C ../backend build-dev create-volumes install-dependencies
make build-dev install-dependencies

# webapp on :8080, storybook on :6006, API on $MS_PORT
make launch-local-dev
# stop the stack (the shared MongoDB keeps running)
make stop-local-dev
```

## Team Standards

This template follows the following standards:

- [Commit types](../../docs/standards/commit-types.md)
- [Branch naming](../../docs/standards/branching.md)
- [Pull request process](../../docs/standards/pull-requests.md)

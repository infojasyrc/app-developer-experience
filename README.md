# App Developer Experience

This is a project to build an application using microservices considering a monorepo

## Content

- [Content](#content)
- [Folder structure](#folder-structure)
- [Conventional commits](#conventional-commits)
  - [Why use node tools for git hooks](#why-use-node-tools-for-git-hooks)
- []

## Folder structure

- mobile-app: use different technologies to build a mobile app
  - whitewalker: app with react native standalone
  - whitewolf-rn: app using expo
- backend: using nodejs and python to build microservices
  - ms-nestjs-gql-tpl: build microservice using nodejs, nestjs with graphql
  - ms-nestjs-rest-tpl: build microservice using nodejs, nestjs for rest
  - ms-fastapi-rest-tpl: build microservice using python, fastapi for rest
- [conference-manager](./conference-manager/README.md):
  - docker-compose: orchestrate all the elements of the solution
  - [ms-conference-webapp](./conference-manager/ms-conference-webapp/README.md): webapp to connect with ms-conference-api to bring all data
  - [ms-conference-admin](./conference-manager/ms-conference-admin/README.md): microservice to show an admin dashboard to manage all information
  - [ms-conference-api](./conference-manager/ms-conference-api/README.md): microservice to handle all REST operations
- docs:
  - [code review](./docs/CodeReview.md): guideline for an effective code review
  - [security](./docs/Security.md): guideline to consider all security aspects to develop solutions with containers

## Understanding the challenges

Because Microservices is on trending, most of the companies believe managing multiple repos, is the best way to go.
However, Monorepos brings another perspective and also some challenges to be consider before using it.

![Mono Repo Analysis](./docs/media/monorepo.png)

## Conventional commits

In order to handle all projects and packages, the project requires:

- nodejs v22.15.0
- husky
- @commitlint/cli
- @commitlint/config-conventional

### Why use Node tools for git hooks?

Because:
• Commitlint is the most mature and flexible tool for enforcing Conventional Commits.
• Husky is the most popular Git hooks manager — works across any tech stack (Python, JS, Go, etc.).

It’s completely fine and common to install these tools just for Git hook purposes in any project, including Python.

## Requirements

- Install nvm
- Run the following commands

```bash
# install specific version of nodejs
nvm install v22.15.0
# set node version in current shell
nvm use v22.15.0
# installing husky validations
make setup-commit-validation
```

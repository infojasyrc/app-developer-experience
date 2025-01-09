# Monorepo

This is a project to build an application using microservices considering a monorepo

## Content

- [Content](#content)
- [Folder structure](#folder-structure)

## Folder structure

- mobile-app: use different technologies to build a mobile app
  - whitewalker: app with react native standalone
  - whitewolf-rn: app using expo
- backend: using nodejs and python to build microservices
  - ms-nestjs-gql-tpl: build microservice using nodejs, nestjs with graphql
  - ms-nestjs-rest-tpl: build microservice using nodejs, nestjs for rest
  - ms-fastapi-rest-tpl: build microservice using python, fastapi for rest
- docs:
  - [code review](./docs/CodeReview.md): guideline for an effective code review
  - [security](./docs/Security.md): guideline to consider all security aspects to develop solutions with containers

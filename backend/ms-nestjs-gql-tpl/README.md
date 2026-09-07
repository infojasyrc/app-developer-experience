# Microservice Nestjs Template

This project is a template for microservices using nestjs with hexagonal architecture.

## What is it

This is microservice built with nodejs and nestjs

## Contents

- [Microservice Nestjs Template](#microservice-nestjs-template)
  - [What is it?](#what-is-it)
- [Contents](#contents)
- [Application Architecture](#application-architecture)
- [Project Dependencies](#project-dependencies)
- [Getting started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the app](#running-the-app)
  - [Test execution](#test-execution)
- [Conventional commits](#conventional-commits)
  - [Structural Elements](#structural-elements)
  - [Proposals Type Commits](#proposals-type-commit)
  - [Usage](#usage)
  - [Working and link Jira/Trello cards](#working-and-link-jira/trello-cards)
- [Team agreements](#team-agreements)
  - [Branch Naming](#branch-naming)
- [Pull Request Process](#pull-request-process)
  - [PR Structure](#pr-structure)
  - [Work In Progress](#work-in-progress)
  - [PR Automation](#pr-automation)

## Application Architecture

TODO: Add here the evolution of our architecture.

## Project Dependencies

We are using the following dependencies:

- Node 20.18.1 according Dockerfile

## Getting started

### Installation

```bash
$ npm install
```

### Configuration

Create a file called **.env** based on template file **.env.example**, filled with the right values

| Variable                         | Description                            | Required | Default Value |
| -------------------------------- | -------------------------------------- | -------- | ------------- |
| HTTP_PORT                        | HTTP server listening port             | No       | 3000          |


### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test execution

```bash
# unit tests
$ npm run test:unit

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Conventional commits

Specification that provides a convention in commit messages and fits with [SemVer](https://semver.org/) describing in
commit messages

### Structural Elements

Every commit, must have a message to communicate it's intent to other developers who read the commit history

The structure of commit messages should be like:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Working and link Jira/Trello cards

To trace our work with the git commit history, we can link our commits with Trello or Jira providing this way:

#### Azure DevOps

`feat: add new implementation to Xyz (123)` being `123` Trello card

## Team Agreements

### Branch Naming

According to our branch strategy: trunk based development, each developer will create a feature branch will the following pattern:

user/typeoftask/task-name

As an example: jose/feat/add-team-agreements-in-docs

## Pull Request Process

### PR Structure

As part of our definition of DONE and our team agreements, when a development submit all changes and create a pull request, this should follow:

```
title: [TEAM_ACRONYM-Number] User story title
description: Summarize all the changes within a detail list.

Choose a label for each pull request: enhancement, bug
```

### Work In Progress

To maximize the visibility of our progress, as a team, we can use two options:

- Use WIP prefix on the pull request, which means: Work in progress
- Use draft pull request when it is created

### PR Automation

TODO: As a team, we need to:

- Look for a way to automate this process using github-cli


# CLAUDE.md

This is a mono repo to handle multiple packages such as microservices to build restful api and graphql inside backend, 
apps templates inside mobile-app, pipeline templates inside devops, terraform and bicep infrastructure as code inside cloud 
and a solution to handle conferences inside conference manager.

1. **Microservices** - Restful and GraphQL microservice templates to build services using fastapi and nestjs

2. **Mobile App Templates** - React Native and Expo templates using typescript

3. **DevOps Pipelines** - Pipeline templates to deploy containers and insfrastructure as code using terraform and bicep

4. **Infrastructure as Code (IaC)** - Complete web application infrastructure to deploy on AWS or Azure.

## Common Tasks

## Key Project Locations

### Conference Manager

- **`conference-manager/ms-conference-admin`** - handle and manage all data using django
- **`conference-manager/ms-conference-api`** - handle all restful oeprations for the solution
- **`conference-manager/ms-conference-webapp`** - show all conference information using nextjs
- **`conference-manager/docker-compose`** - orchestrate all containers for local execution

### Microservices

- **`backend/ms-fast-api-rest-tpl`** - restful api using fastapi
- **`backend/ms-nestjs-gql-tpl`** - graphql api using nestjs
- **`backend/ms-nestjs-rest-tpl`** - graphql api using nestjs
- **`backend/ms-nestjs-rest-tpl`** - restful api using nestjs

### Mobile App Templates

- mobile-app/whitewalker: react native template
- mobile-app/whitewolf: expo template

### DevOps Pipelines

- devops/ci-aws-backend: to publish microservices in aws container registry
- devops/ci-aws-webapp: to publish mobile app in aws container registry
- devops/deploy_infrastrucure: pipelines to check, plan, apply and destroy infrastructure using terraform

### Infrastructure as Code (IaC)

- cloud/terraform

## Key Architectural Concepts

- **Domain Driven Development** All microservices, restful api and graphql services should use DDD to manage all features

## Metrics

- Coverage: Each component should handle 80% code coverage
- Container Image Size: Each container should be optimize in size keeping ONLY source code

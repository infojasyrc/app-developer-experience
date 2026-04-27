# CLAUDE.md

This is a monorepo that handles multiple packages: microservices for RESTful
and GraphQL APIs, mobile app templates, DevOps pipeline templates, Terraform
infrastructure as code, and a conference management solution.

> **For exact filesystem paths** see `agents/shared/context/monorepo-paths.md`.
> That file is the single source of truth for all directory locations.

---

## Solutions

1. **Conference Manager** — Full solution: Django admin, RESTful API, Next.js webapp
2. **Microservices** — RESTful (FastAPI, NestJS) and GraphQL (NestJS) templates
3. **Mobile App Templates** — React Native and Expo templates using TypeScript
4. **DevOps Pipelines** — CI/CD pipelines for containers and IaC (Terraform, Bicep)
5. **Infrastructure as Code** — AWS (Terraform) and Azure (Bicep) deployments

---

## Key Project Locations

See `agents/shared/context/monorepo-paths.md` for canonical paths.

| Area | Root Path |
|---|---|
| Conference Manager | `conference-manager/` |
| Backend microservices | `backend/` |
| Mobile templates | `mobile-app/` |
| DevOps pipeline templates | `devops/` |
| Infrastructure (AWS) | `cloud/terraform/aws` |
| Infrastructure (Azure) | `cloud/terraform/azure` |
| GitHub Actions | `.github/workflows/` |
| AI Agents | `agents/` |

---

## Key Architectural Concepts

- **DDD** — All microservices use Domain Driven Design to organize features
- **Clean Architecture** — Separation of domain, application, and infrastructure layers
- **Container-first** — Every service ships as an optimized Docker image (source only)

---

## Metrics

- **Coverage:** 80% minimum per component
- **Container image size:** Optimized — only source code, no dev dependencies

---

## Common Tasks

Before running any agent task, read:
```bash
cat agents/shared/context/monorepo-paths.md
```
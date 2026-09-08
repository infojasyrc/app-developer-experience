# CLAUDE.md

This is a monorepo that handles multiple packages: services for RESTful
and GraphQL APIs, mobile app templates, DevOps pipeline templates, Terraform
infrastructure as code, and a conference management solution.

> **For exact filesystem paths** see `agents/shared/context/monorepo-paths.md`.
> That file is the single source of truth for all directory locations.

---

## Solutions

1. **Conference Manager** — Full solution: Django admin, RESTful API, Next.js webapp
2. **Backend Services** — RESTful (FastAPI, NestJS) and GraphQL (NestJS) templates
3. **Mobile App Templates** — React Native and Expo templates using TypeScript
4. **DevOps Pipelines** — CI/CD pipelines for containers and IaC (Terraform, Bicep)
5. **Infrastructure as Code** — AWS (Terraform) and Azure (Bicep) deployments
6. **Knowledge MCP** — runtime service that exposes ADE conventions to other repos/agents (`tools/knowledge-mcp/`)

---

## Key Project Locations

See `agents/shared/context/monorepo-paths.md` for canonical paths.

| Area | Root Path |
|---|---|
| Conference Manager | `conference-manager/` |
| Backend services | `backend/` |
| Mobile templates | `mobile-app/` |
| DevOps pipeline templates | `devops/` |
| Infrastructure (AWS) | `cloud/terraform/aws` |
| Infrastructure (Azure) | `cloud/terraform/azure` |
| GitHub Actions | `.github/workflows/` |
| AI Agents | `agents/` |
| Knowledge MCP | `tools/knowledge-mcp/` |

### Conference Manager project aliases

Short names for branches, commits, PR checkboxes, and agent plans. They are **not** directory names. Full map: `agents/shared/context/monorepo-paths.md`.

| Project alias | Resolves to |
|---|---|
| `cm-api` | `conference-manager/ms-conference-api/` |
| `cm-webapp` | `conference-manager/ms-conference-webapp/` |
| `cm-admin` | `conference-manager/ms-conference-admin/` |
| `cm-tools` | observability files under `conference-manager/ms-conference-api/` (no dedicated folder) |

---

## Key Architectural Concepts

- **DDD** — All services use Domain Driven Design to organize features
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

NestJS backend templates (`NESTJS_REST`, `NESTJS_GQL`) are container-first. From the template directory:

```bash
cd backend/nestjs-*-tpl && make help
```

Use only Make targets (`build-dev`, `create-volumes`, `install-dependencies`, `launch-local`, `lint`, `unit-tests`, `build-prod`). Never run host `npm`, `node`, or `nvm` in those packages.
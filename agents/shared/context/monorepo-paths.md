# Monorepo Paths — Source of Truth

Canonical paths for the ADE monorepo. Derived from `CLAUDE.md`.
All agents and skills MUST read this file before referencing any directory.
Never hardcode paths in AGENT.md or SKILL.md — always derive from here.

---

## Infrastructure

| Alias | Resolved Path | Description |
|---|---|---|
| `TERRAFORM_ROOT` | `cloud/terraform/` | Root of all Terraform modules (AWS + Azure) |
| `TERRAFORM_AWS` | `cloud/terraform/aws/` | AWS-specific Terraform modules |
| `TERRAFORM_AZURE` | `cloud/terraform/azure/` | Azure-specific Terraform modules |
| `INFRA_PLANS` | `agents/infrastructure/plans/` | Agent-produced plan artifacts (INFRA_PLAN.md) |

## Conference Manager

| Alias | Resolved Path | Description |
|---|---|---|
| `CONF_ROOT` | `conference-manager/` | Conference Manager solution root |
| `WEBAPP_ROOT` | `conference-manager/ms-conference-webapp/` | Next.js webapp (migration target) |
| `WEBAPP_LEGACY` | `conference-manager/ms-conference-webapp/legacy/` | Legacy React source |
| `WEBAPP_SRC` | `conference-manager/ms-conference-webapp/src/` | Next.js webapp source code |
| `WEBAPP_APP` | `conference-manager/ms-conference-webapp/src/app/` | Next.js App Router routes |
| `CONF_API` | `conference-manager/ms-conference-api/` | RESTful API service |
| `CONF_ADMIN` | `conference-manager/ms-conference-admin/` | Django admin service |
| `FRONTEND_PLANS` | `conference-manager/ms-conference-webapp/plans/` | MIGRATION_PLAN.md lives here |

## Backend Microservice Templates

| Alias | Resolved Path | Description |
|---|---|---|
| `BACKEND_ROOT` | `backend/` | All microservice templates |
| `MS_FASTAPI` | `backend/ms-fast-api-rest-tpl/` | FastAPI RESTful template |
| `MS_NESTJS_REST` | `backend/ms-nestjs-rest-tpl/` | NestJS RESTful template |
| `MS_NESTJS_GQL` | `backend/ms-nestjs-gql-tpl/` | NestJS GraphQL template |

## DevOps Pipeline Templates

| Alias | Resolved Path | Description |
|---|---|---|
| `DEVOPS_ROOT` | `devops/` | All pipeline templates |
| `CI_AWS_BACKEND` | `devops/ci-aws-backend/` | CI for backend microservices → AWS ECR |
| `CI_AWS_WEBAPP` | `devops/ci-aws-webapp/` | CI for webapp → AWS ECR |
| `DEPLOY_INFRA` | `devops/deploy_infrastructure/` | Terraform plan/apply/destroy pipelines |
| `GHA_WORKFLOWS` | `.github/workflows/` | GitHub Actions workflow files |
| `PIPELINE_REPORTS` | `.github/debug-reports/` | Agent-produced debug reports |

## Mobile App Templates

| Alias | Resolved Path | Description |
|---|---|---|
| `MOBILE_ROOT` | `mobile-app/` | All mobile templates |
| `MOBILE_RN` | `mobile-app/whitewalker/` | React Native template |
| `MOBILE_EXPO` | `mobile-app/whitewolf/` | Expo template |

## Agent Outputs

| Alias | Resolved Path | Description |
|---|---|---|
| `AGENTS_ROOT` | `agents/` | All agent definitions |
| `SHARED_CONTEXT` | `agents/shared/context/` | This directory |
| `FRONTEND_OUTPUT` | `agents/frontend/frontend-planner/output/` | Migration plans |
| `INFRA_OUTPUT` | `agents/infrastructure/infra-planner/output/` | Infra plans |
| `PIPELINE_OUTPUT` | `agents/infrastructure/pipeline-debugger/output/` | Debug reports |

---

## How agents use this file

```bash
# Step 1 — always first
cat agents/shared/context/monorepo-paths.md

# Step 2 — set the aliases you need
TERRAFORM_AWS="cloud/terraform/aws"
WEBAPP_ROOT="conference-manager/ms-conference-webapp"

# Step 3 — use aliases in all commands
find $TERRAFORM_AWS -name "*.tf"
grep -rn "useState" $WEBAPP_ROOT/src/
```

---

## Change protocol

If any path changes in the monorepo:
1. Update **only this file**
2. Update `CLAUDE.md` Key Project Locations section to match
3. All agents and skills pick up the change automatically
4. Never update paths in individual SKILL.md or AGENT.md files
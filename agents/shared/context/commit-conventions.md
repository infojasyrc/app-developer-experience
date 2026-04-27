---
name: commit-conventions
description: >
  Conventional commits rules for all agent-generated changes in the ADE
  monorepo. All agents MUST read this file before producing any plan or
  report that involves file modifications. Defines commit type per change
  category, scope conventions, and PR structure requirements.
metadata:
  author: app-dev-exp
  version: "1.0"
---

# Commit Conventions — ADE Monorepo

All agent-generated changes MUST follow [Conventional Commits 1.0](https://www.conventionalcommits.org/).
This file is the single source of truth for commit rules across all agents.

---

## Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer: BREAKING CHANGE, refs, closes]
```

Rules:
- `type` and `scope` are lowercase
- Description is imperative mood, no period at end
- Max 72 characters in the subject line
- Body explains **what** and **why**, not how

---

## Types by change category

| Type | When to use | Examples |
|---|---|---|
| `feat` | New functionality added to the codebase | New route, new component, new Terraform resource |
| `fix` | Bug fix or correction of a misconfiguration | Fix IAM policy, fix broken route, fix security group rule |
| `chore` | Maintenance — no production code change | Add `.gitkeep`, update `.gitignore`, rename folder |
| `docs` | Documentation only | Update `CLAUDE.md`, `AGENTS.md`, `MIGRATION_PLAN.md`, `INFRA_PLAN.md` |
| `refactor` | Code restructure without behavior change | Convert component to RSC, reorganize Terraform modules |
| `ci` | CI/CD pipeline changes | Fix GitHub Actions workflow, update deploy steps |
| `infra` | Infrastructure-as-code changes | Terraform modules, IAM roles, security groups |
| `style` | Formatting, no logic change | Prettier fixes, whitespace |
| `test` | Tests only | Add Playwright test, add Vitest spec |
| `revert` | Reverting a previous commit | — |

---

## Scopes by domain

| Scope | Domain | Used by |
|---|---|---|
| `webapp` | `ms-conference-webapp` | frontend-planner, frontend-developer |
| `api` | `ms-conference-api` | backend agents (future) |
| `admin` | `ms-conference-admin` | backend agents (future) |
| `ecs` | ECS Fargate resources | infra-developer |
| `iam` | IAM roles and policies | infra-developer |
| `ecr` | ECR repositories | infra-developer |
| `rds` | RDS instances | infra-developer |
| `network` | VPC, subnets, security groups | infra-developer |
| `gha` | GitHub Actions workflows | pipeline-debugger |
| `agents` | Agent definitions and skills | any agent |
| `deps` | Dependency changes | any agent |

---

## Commit examples per agent

### frontend-planner
```
docs(webapp): add migration plan for React 19 to Next.js 16
```

### frontend-developer — Phase A
```
refactor(webapp): migrate React Router routes to App Router

- Replace createBrowserRouter with file-system routing
- Add app/layout.tsx as root layout
- Move legacy router config to legacy/_legacy/

Refs: MIGRATION_PLAN.md Phase A
```

### frontend-developer — Phase B
```
refactor(webapp): convert components to RSC and RCC

- Add 'use client' to 12 interactive components
- Extract ConferenceProvider to providers/conference-provider.tsx
- 8 components converted to RSC (no directive)

Refs: MIGRATION_PLAN.md Phase B
```

### frontend-developer — Phase C
```
refactor(webapp): migrate data fetching to RSC async pattern

- Convert 5 useEffect+fetch components to async RSC
- Rename REACT_APP_* env vars to NEXT_PUBLIC_*
- Add lib/api/server.ts for centralized server fetch

Refs: MIGRATION_PLAN.md Phase C
```

### frontend-developer — Phase D
```
chore(deps): remove react-router-dom after App Router migration
```

### infra-developer — Terraform
```
infra(ecs): add Fargate task definition and service modules

- Set network_mode to awsvpc (required for Fargate)
- Configure private subnet placement
- Enable deployment circuit breaker with rollback

Refs: INFRA_PLAN.md Phase A
```

### infra-developer — IAM
```
infra(iam): add ECS execution and task roles with least-privilege policies

- Execution role: ECR pull + CloudWatch + Secrets Manager at startup
- Task role: SSM + Secrets Manager at runtime
- GitHub Actions OIDC role scoped to deploy branch

Refs: INFRA_PLAN.md Phase B
```

### pipeline-debugger
```
ci(gha): fix OIDC authentication and ECR push permissions

- Add id-token: write permission to deploy workflow
- Upgrade aws-actions/configure-aws-credentials to v4
- Add AWS_ROLE_ARN to required secrets list

Refs: PIPELINE_DEBUG_REPORT.md
```

---

## PR structure rules

Each agent phase = one PR. Never mix phases in a single PR.

| PR title format | Example |
|---|---|
| `<type>(<scope>): <description>` | `refactor(webapp): Phase A — App Router migration` |

PR description must include:
1. **What changed** — list of files created/modified
2. **Why** — reference to the plan artifact (`MIGRATION_PLAN.md`, `INFRA_PLAN.md`, etc.)
3. **Verification** — output of `tsc --noEmit`, `terraform validate`, or `gh run view`
4. **Refs** — link to the plan file in the repo

---

## How agents use this file

At the start of any task that produces file changes, read this file:

```bash
cat agents/shared/context/commit-conventions.md
```

Then include in your completion report:

```
## Suggested commits for this phase

feat(webapp): ...
refactor(webapp): ...

## Suggested PR title
refactor(webapp): Phase A — App Router routing migration
```

---

## BREAKING CHANGE footer

Use when a change requires action from other developers:

```
refactor(webapp): replace React Router with Next.js App Router

BREAKING CHANGE: All useNavigate() calls replaced with useRouter() from
next/navigation. Developers must update any custom hooks that wrap
useNavigate before merging feature branches.
```
# Agents Index — ADE Monorepo

## Overview

This file is the global index of all AI agents available in this monorepo.
Before invoking any agent, read this file to understand the orchestration rules
and which agent is appropriate for the task.

---

## Orchestration Rules

- **Always run a planner before a developer** — never implement without a plan artifact
- Plans are stored in the target app root as `MIGRATION_PLAN.md`
- Each agent documents its expected inputs and outputs in its own `AGENT.md`
- Skills live inside the agent that owns them — never share skills between agents directly; use `agents/shared/` for that

---

## Available Agents

### Frontend

| Agent | Role | Status | Trigger when... |
|---|---|---|---|
| `frontend-planner` | Analyzes frontend codebases, produces migration and audit plans | ✅ Active | you need a plan before touching frontend code |
| `frontend-developer` | Implements frontend plans, writes production code | ✅ Active | you have a ready and approved `MIGRATION_PLAN.md` |

### Infrastructure

| Agent | Role | Status | Trigger when... |
|---|---|---|---|
| `infra-planner` | Audits Terraform modules and IAM config, produces remediation plan | ✅ Active | you need to diagnose infra or IAM issues before making changes |
| `infra-developer` | Implements Terraform and IAM fixes from the plan | ✅ Active | you have a ready and approved `INFRA_PLAN.md` |
| `pipeline-debugger` | Diagnoses GitHub Actions failures, proposes fixes as diffs | ✅ Active | a CI/CD workflow is failing and you need root cause analysis |

---

## Shared Context

Before starting any task, all agents MUST read:

```bash
cat agents/shared/context/monorepo-paths.md
cat agents/shared/context/commit-conventions.md
```

- `monorepo-paths.md` — single source of truth for all filesystem paths
- `commit-conventions.md` — conventional commits rules for all agent-generated changes

## Agent Locations

```
agents/
├── shared/
│   └── context/
│       ├── monorepo-paths.md      ← filesystem paths — read first, always
│       └── commit-conventions.md  ← conventional commits rules — read always
├── frontend/
│   ├── frontend-planner/          → AGENT.md + skills/
│   └── frontend-developer/        → AGENT.md + skills/
└── infrastructure/
    ├── infra-planner/             → AGENT.md + skills/
    ├── infra-developer/           → AGENT.md + skills/
    └── pipeline-debugger/         → AGENT.md + skills/
```

---

## Handoff Protocol

```
1. Planner reads source codebase
2. Planner produces MIGRATION_PLAN.md at target app root
3. Human reviews and approves the plan
4. Developer reads MIGRATION_PLAN.md and implements phase by phase
5. Developer never deviates from the plan without flagging it
```
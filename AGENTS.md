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

### Backend

| Agent | Role | Status | Trigger when... |
|---|---|---|---|
| `backend-planner` | Analyzes backend services, produces refactor/migration plans | 🔜 Planned | — |
| `backend-developer` | Implements backend plans | 🔜 Planned | — |

### Shared

| Skill | Role | Status |
|---|---|---|
| `code-reviewer` | Cross-domain code review | 🔜 Planned |
| `changelog-generator` | Generates CHANGELOG.md from conventional commits | 🔜 Planned |

---

## Agent Locations

```
agents/
├── frontend/
│   ├── frontend-planner/     → AGENT.md + skills/
│   └── frontend-developer/   → AGENT.md + skills/  (planned)
├── backend/
│   ├── backend-planner/      → (planned)
│   └── backend-developer/    → (planned)
└── shared/                   → (planned)
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
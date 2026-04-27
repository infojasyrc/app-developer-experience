# Understanding Agentic strategy

## Contents

- [Contents](#contents)
- [Project Strategy](#project-strategy)
- [Project Structure](#project-structure)
- [Skill Specification](#skill-specification)

## Project Strategy

CLAUDE.md
│  "what is the project, what solutions it has, conventions"
│  → reference to monorepo-paths.md for exact paths
│
agents/shared/context/monorepo-paths.md
│  "where exactly each thing is — resolvable paths"
│  → read by all agents at the start of each task
│
AGENTS.md
   "what agents exist, how to orchestrate them"
   → read by Claude Code when it needs to delegate a task

Maintenance rule: if you move a directory in the repo, only touch monorepo-paths.md and add a line in CLAUDE.md if the change is structural. Never touch the individual SKILL.md files.

## Project Structure

```md
app-developer-experience/
├── CLAUDE.md                        ← automatically read by Claude Code
├── AGENTS.md                        ← global index of your agents
│
├── .claude/                         ← Claude Code configuration (committed)
│   ├── settings.json
│   ├── commands/                    ← reusable slash commands
│   │   ├── debug-pipeline.md        ← /debug-pipeline → launches pipeline-debugger
│   │   ├── audit-infra.md           ← /audit-infra → launches infra-planner
│   │   └── migrate-frontend.md      ← /migrate-frontend → launches frontend-planner
│   ├── rules/                       ← rules by domain (auto-loaded)
│   │   ├── terraform.md
│   │   └── frontend.md
│   └── agents/                      ← native Claude Code agents (future)
│
└── agents/                          ← YOUR agents (skills, plans, context)
    ├── shared/
    │   └── context/
    │       └── monorepo-paths.md
    │       └── commit-conventions.md
    ├── frontend/
    │   ├── frontend-planner/
    │   └── frontend-developer/
    └── infrastructure/
        ├── infra-planner/
        ├── infra-developer/
        └── pipeline-debugger/
```

## Skill Specification

https://agentskills.io/specification

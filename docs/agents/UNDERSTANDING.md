# Understanding Agentic strategy

## Contents

- [Contents](#contents)
- [Project Structure](#project-structure)
- [Skill Specification](#skill-specification)

## Project Structure

.claude/CLAUDE.md
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

## Skill Specification

https://agentskills.io/specification

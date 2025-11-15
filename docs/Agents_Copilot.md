# Configure Copilot and Agents

## Prepare instructions

- Create a folder inside .github called instructions
- Add specific instructions for frontend: frontend.instructions.md and backend: backend.instructions.md
- Enable github.copilot.chat.codeGeneration.useInstructionFiles setting.

In settings.json inside .vscode:
```json
{
    "github.copilot.chat.codeGeneration.useInstructionFiles": true
}
```

## Why `copilot-instructions.md` Matters

The file `.github/copilot-instructions.md` centralizes project-specific operational knowledge so AI agents become productive immediately without rediscovering patterns. It encodes:
- Monorepo layout (templates vs product code) to avoid editing archetypes when changing product services.
- Hybrid legacy + modern architecture for `ms-conference-api` (Express v1 + NestJS) to prevent mixing validation layers or expanding deprecated controllers.
- Environment/version switching (Node 18 for services vs Node 22.15.0 for commit tooling) to avoid dependency breakage.
- Standard Makefile and npm workflows per stack so automation is reused instead of ad-hoc commands.
- Migration guidance: new REST endpoints belong in Nest (`src/interfaces` + `src/modules`) rather than `src/controllers/v1`.
- Pitfalls (DB host differences, Mongo collection bootstrap, Firebase provider usage) to reduce troubleshooting noise.

Agents should read this file before refactors, endpoint additions, or creating microservices.

## Role of `.github/instructions/` Folder

Scoped instruction files auto-apply during code generation to enforce style and structural conventions:
- `backend.instructions.md`: Clean Code / Clean Architecture, 4-space indentation, descriptive names, unit tests for critical logic.
- `web_development.instructions.md`: Airbnb JS style, 2-space indentation, single quotes, Atomic Design for components.

Effects:
- Guides formatting & layering decisions without restating rules in every prompt.
- Separates backend vs web style (indentation, architecture principles).
- Encourages test creation for modified backend logic.

## Using Both Layers Together

1. Read `.github/copilot-instructions.md` for macro decisions (feature placement, migration path).
2. Let instruction files shape micro decisions (indentation, naming, layering) during edits.
3. Backend feature in `ms-conference-api`: apply migration rules (Nest path) + backend style instructions.
4. Webapp UI change: follow Atomic Design structure before adding new component directories.

## When to Update These Files

Update `.github/copilot-instructions.md` when architecture boundaries change, workflows evolve, or recurring pitfalls emerge.
Update instruction files when formatting/testing baselines shift or domain-specific enforceable rules are adopted.

## Quick Checklist for Agents

Before coding:
- Confirm target directory (template vs product code).
- Check Node version (`.nvmrc` vs root tooling).
- Decide Nest vs Express path for API changes.
- Locate or plan tests mirroring source domain.
During coding:
- Apply indentation & naming per instruction file.
- Avoid modifying template archetypes unintentionally.
- Place new Nest controllers under `src/interfaces`, services/entities under `src/modules`.
After coding:
- Add/update unit tests.
- Use existing Make/npm scripts.
- Consider whether new pitfalls merit updating instructions.

## References

https://code.visualstudio.com/docs/copilot/customization/custom-instructions#_use-an-agentsmd-file-experimental

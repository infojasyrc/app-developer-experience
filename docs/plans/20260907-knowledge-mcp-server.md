# Knowledge MCP Server

**Superseded** by [docs/plans/20260908-knowledge-mcp-server.md](20260908-knowledge-mcp-server.md). Do not implement from this draft.

## Problem
`app-developer-experience` centralizes org conventions (CLAUDE.md, AGENTS.md, `.cursor/rules/*.mdc`, platform templates). Today that knowledge is only usable inside this repo via Cursor. We want an MCP server that:
1. Exposes this knowledge so other repos/agents can query it while building.
2. Compares a target project's setup against known best-practice patterns (conventional commits, AWS solution templates, Makefiles, etc.) and reports gaps.

## Non-goals (v1)
- Not a bootstrap template itself — it's a runtime service (same category as `conference-manager`, not `backend/`, `cli/`, etc.).
- Not an auto-fixer. It reports gaps; it doesn't rewrite target repos.

## Placement in monorepo
New Nx app: `tools/knowledge-mcp/` (or `platform/knowledge-mcp/` if you want it grouped with bootstrap components — but tag it clearly as a *service*, not a template, in its own `.cursor/rules/knowledge-mcp.mdc`).

Stack: FastAPI (matches existing backend template convention), container-first, ≥80% coverage — consistent with `CLAUDE.md`.

## Architecture
**Ingestion layer**
- Parses `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*.mdc`, `TEMPLATE.md`, per-component docs into structured records (topic, scope glob, content).
- Re-run on demand or via Nx target (`nx run knowledge-mcp:sync`).

**MCP resources** (read-only knowledge)
- `conventions://tech-stack`, `conventions://ddd-clean-architecture`, `conventions://plan-template`, `conventions://component/{name}` etc.

**MCP tools**
- `get_convention(topic)` — returns relevant excerpt(s) + source file.
- `scaffold_guidance(component_type)` — returns which platform template to bootstrap from and how (reinforces bootstrap-template model instead of duplicating scaffolding logic).
- `compare_gaps(target_repo_manifest)` — diffs a target project's detected setup against a curated reference set (see below) and returns missing/outdated pieces.

**Reference dataset (for gap analysis)**
- Versioned YAML/JSON, curated manually, e.g.:
  ```
  categories:
    commits: conventional-commits
    iac: [terraform, bicep, aws-sam, aws-cdk]
    build-tooling: [makefile, taskfile]
    containerization: [dockerfile, compose]
  ```
- Needs an owner + review cadence (decide: quarterly review, or triggered by a plan doc when a new pattern is adopted).

## Phasing
1. **MVP** — read-only resources + `get_convention`. Validates ingestion + MCP wiring.
2. **Scaffold guidance** — `scaffold_guidance` tool pointing to correct platform template.
3. **Gap analysis** — `compare_gaps` with the curated reference set; start with conventional commits + Makefiles (cheap to detect), then IaC templates.
4. **Feedback loop** — gaps found in real usage get proposed back as edits to `CLAUDE.md`/`AGENTS.md`/rules (manual PR, not automatic).

## Testing
- Unit tests per tool/resource.
- Integration test: point the MCP at `conference-manager/` itself as a known-gap fixture (e.g., Django/FastAPI mismatch should surface as a *documented exception*, not a false-positive gap).

## Open decisions (need your input before implementation)
- Exact directory: `tools/` vs `platform/knowledge-mcp/`.
- How the reference dataset is curated/updated (manual PRs vs. periodic research pass).
- Distribution: internal-only vs. published for other teams' repos to consume.

## Next step
Confirm the open decisions above, then create `.cursor/rules/knowledge-mcp.mdc` and start Phase 1 per the existing plan → implement workflow.

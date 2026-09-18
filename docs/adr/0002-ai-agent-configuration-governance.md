# ADR 0002: AI Agent Configuration Governance

- Status: Accepted
- Date: 2026-09-18
- Deciders: ADE platform
- Tags: claude-code, cursor, knowledge-mcp, conventions, permissions

## Context

This monorepo is read by more than one AI coding tool: Claude Code
(`CLAUDE.md`, `.claude/`) and Cursor (`.cursor/rules/*.mdc`, `.cursor/mcp.json`),
plus a vendor-neutral `AGENTS.md`. Each reads a different, tool-specific
config format, so the same underlying convention (a path, a Make target, a
coverage threshold, a permission) risks being written down more than once and
drifting — one vendor's file gets updated, the other doesn't, and an agent
reading the stale one acts on outdated information.

`docs/analysis/genai-vendor-config-governance.md` audited the actual state of
these files and found the repo had already half-solved this: content
conventions live in `agents/shared/context/*.md` and are pointed to (not
copied) by `CLAUDE.md`, `AGENTS.md`, and `.cursor/rules/000-core.mdc`, and
`tools/knowledge-mcp` ingests those same sources to answer `get_convention`.
Two things were not solved: **agent tool permissions** (Claude Code's
`.claude/settings.json` allow/deny list had no Cursor equivalent and no
shared source of truth) and **MCP client parity** (Cursor had a committed
`.cursor/mcp.json.example`; Claude Code had no equivalent `.mcp.json.example`).

We needed a durable decision record — not just an analysis doc — so the
pattern survives beyond the PR that introduced it, the same reason ADR 0001
exists for the Makefile-facade term.

## Decision

1. **Keep both `.claude/` and `.cursor/`.** They are not duplicate
   configuration — they are two tools' native loading mechanisms
   (Claude Code: flat/nested memory + enforced `settings.json` permissions;
   Cursor: glob-scoped `.mdc` auto-attach). Neither tool reads the other's
   format. Removing either breaks that tool's users.
2. **One fact, one file, thin adapters.** Every convention an agent needs
   lives in exactly one of `agents/shared/context/*.md`, `docs/standards/`,
   or `docs/adr/`. `CLAUDE.md`, `AGENTS.md`, and `.cursor/rules/*.mdc` may
   only summarize and point to that file, never restate it as a second
   source of truth. Enforced by the checklist in
   `docs/standards/pull-requests.md` ("Changing a shared AI-agent
   convention").
3. **Tool permissions get the same treatment as content.** The autonomy
   boundary — what an agent may run without asking — is now written once in
   `agents/shared/context/tool-policy.md`, including an explicit enforcement
   matrix per vendor. `.claude/settings.json` is the only vendor with real,
   harness-enforced permissions today; Cursor's equivalent is advisory text
   in `.cursor/rules/000-core.mdc`. That asymmetry is documented, not hidden.
4. **MCP client config has one template per vendor.** `.cursor/mcp.json.example`
   (existing) and `.mcp.json.example` (new, root) both wrap the same
   `ade-knowledge` Docker command; only the file location and wrapper key
   differ, per `tools/knowledge-mcp/README.md`'s client table.
5. **`knowledge-mcp` ingestion is a CI gate, not just an on-demand tool.**
   `.github/workflows/pull_request_knowledge_governance.yml` runs `make sync`
   on any PR touching a knowledge source, so a file that breaks ingestion
   (bad frontmatter, malformed headings) fails CI instead of silently
   degrading `get_convention`. This does **not** check that `CLAUDE.md` and
   `.cursor/rules/000-core.mdc` agree semantically — no tool does that yet;
   `compare_gaps` diffs an external consumer repo's manifest against
   `data/reference.yaml`, it does not diff ADE's own adapter files against
   each other. That remains a manual review step (the PR checklist).

## Consequences

- A convention change now touches at most: the one shared-context/standards
  file, and — only if the change is core or permission-related — a one-line
  pointer update in the adapters. It should never require editing the same
  paragraph in three places.
- Permission changes are reviewable: `.claude/settings.json` and
  `tool-policy.md` are expected to move together in the same PR, so a
  reviewer can catch a denial that was loosened without the rationale
  changing.
- The gap this ADR does **not** close: Cursor still has no committed,
  harness-enforced command allow/deny mechanism in this repo. If Cursor's
  plan later adds one, extend `tool-policy.md`'s enforcement matrix and wire
  it the same way `.claude/settings.json` is wired — do not assume parity
  exists before that mechanism is confirmed.
- `pull_request_knowledge_governance.yml` adds a small CI job to knowledge-
  source PRs (git-gated by `paths:`, so it does not run on unrelated PRs).

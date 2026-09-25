# ADR 0002: AI Agent Configuration Governance

- Status: Accepted
- Date: 2026-09-25
- Deciders: ADE platform
- Tags: claude-code, cursor, permissions, conventions, knowledge-mcp

## Context

This monorepo is worked on through more than one AI coding tool — Claude Code
(`CLAUDE.md`, `.claude/`) and Cursor (`.cursor/`) today, with `AGENTS.md` as a
vendor-neutral entry point. Each tool loads configuration from its own folder,
in its own format, and cannot read the other's.

That gives every convention two possible homes, and the same rule can end up
written down once per vendor:

- **Content conventions** (paths, Make targets, coverage thresholds, naming)
  already had a working pattern: the fact lives once in
  `agents/shared/context/*.md` or `docs/standards/`, and `CLAUDE.md`,
  `AGENTS.md`, and `.cursor/rules/*.mdc` point at it instead of copying it.
- **Execution permissions** did not. Claude Code enforces an allow/deny list
  through `.claude/settings.json`; Cursor now enforces the equivalent through
  two committed files — `.cursor/cli.json` (CLI agent `permissions.allow` /
  `permissions.deny`) and `.cursor/permissions.json` (IDE `terminalAllowlist`
  plus `autoRun.block_instructions`). Three config files, in two syntaxes,
  encoding one rule: `terraform apply`/`destroy`, `make destroy*`, and
  `make bootstrap-all*` must never run unattended.
- **MCP client config** is per-vendor by construction: the same
  `ade-knowledge` container command is launched from `.mcp.json` for Claude Code
  and `.cursor/mcp.json` for Cursor.

Nothing recorded which vendor file played which role, so there was no way for
a reviewer to tell whether a rule tightened in one vendor had been mirrored in
the others, and no stated rule for where a new vendor's files should go.

## Decision

Adopt a **two-layer configuration model**, and require parity across vendors
within the second layer.

### 1. Layer one — shared, reusable, vendor-neutral

Every fact an agent needs lives exactly once, in vendor-neutral Markdown, in
one of: `agents/shared/context/*.md`, `docs/standards/`, or `docs/adr/`. This
layer never contains vendor syntax and is readable by any tool, including
future ones. `tools/knowledge-mcp` ingests it and serves it over MCP
(`get_convention`), so other repos consume the same facts without copying
them.

### 2. Layer two — vendor-specific folders, at deliberate parity

Each vendor gets its own folder holding **only what that vendor's loader
requires**, expressed in that vendor's syntax: `.claude/` for Claude Code,
`.cursor/` for Cursor. A vendor file may translate or summarize layer one. It
may never introduce a rule that layer one does not state.

Roles map across vendors as follows. Adding a new AI vendor means adding a
column, not inventing a new structure:

| Role | Shared source (layer one) | Claude Code | Cursor |
|---|---|---|---|
| Entry-point project context | `AGENTS.md` | `CLAUDE.md` | `.cursor/rules/000-core.mdc` (`alwaysApply: true`) |
| Component-scoped conventions | `agents/shared/context/*.md`, `docs/standards/` | pointers from `CLAUDE.md` | `.cursor/rules/<component>.mdc` (`globs:`) |
| Execution permissions | `agents/shared/context/tool-policy.md` | `.claude/settings.json` (+ gitignored `settings.local.json`) | `.cursor/cli.json` (CLI), `.cursor/permissions.json` (IDE) |
| Subagents and commands | `agents/**/AGENT.md` | `.claude/agents/*.md`, `.claude/commands/*.md` | no committed equivalent today |
| MCP client config | `tools/knowledge-mcp/README.md` client table | `.mcp.json` (template `.mcp.json.example`) | `.cursor/mcp.json` (template `.cursor/mcp.json.example`) |

### 3. Permissions are governed like content, and move together

`agents/shared/context/tool-policy.md` is the single source of truth for the
autonomy boundary and carries the enforcement matrix — what each vendor file
actually enforces and how strongly. Every vendor permission file
(`.claude/settings.json`, `.cursor/cli.json`, `.cursor/permissions.json`) is
updated in the **same PR** as that file. `CLAUDE.md` and
`.cursor/rules/000-core.mdc` carry a prose summary as deliberate redundancy,
so an agent that never opens a config file still reads the rule.

Equivalent intent does not mean identical matching power. Pattern syntaxes
differ per vendor (`Bash(terraform apply*)` vs `Shell(terraform:*apply*)` vs
prefix-matched `terminalAllowlist` entries), so `tool-policy.md` documents the
known coverage differences and remains binding independently of what any one
pattern catches.

### 4. Knowledge sources are CI-gated

`.github/workflows/pull_request_knowledge_governance.yml` runs `make sync` on
any PR touching a layer-one source, so a file that breaks `knowledge-mcp`
ingestion (bad frontmatter, malformed headings) fails CI instead of silently
degrading `get_convention`. This verifies the sources still parse; it does not
verify that the vendor adapters still agree with each other (see Follow-up).

## Alternatives considered

### Shared context layer plus per-vendor folders (chosen)

Keeps one source of truth while respecting that each tool only loads its own
format. Parity becomes a review property of a small, enumerated set of files
rather than an accident.

### One config file that every vendor reads

Rejected: no such format exists. Claude Code reads `.claude/settings.json`,
Cursor reads `.cursor/cli.json` and `.cursor/permissions.json`; neither falls
back to the other, and their permission grammars differ. A single file would
be read by nothing.

### Treat one vendor as primary and the others as best-effort

Rejected: this was effectively the prior state, and it hid the weaker
vendor's gap. A guardrail that exists for one tool and silently not for
another is worse than a documented asymmetry, because reviewers assume
parity.

### Generate the vendor permission files from `tool-policy.md`

Rejected for now, revisit later. It is the logical end state, but the three
targets use materially different grammars (`Bash(...)` glob patterns,
`Shell(<tool>:<args>)` patterns, prefix-matched allowlist strings), so a
generator needs a real translator per vendor plus tests. Not worth building
before the hand-maintained set has proven stable.

## Consequences

- A content-convention change touches the one layer-one file, plus at most a
  one-line pointer update per vendor. It should never require editing the
  same paragraph in three places.
- A permission change now has a fixed, reviewable blast radius: four files
  (`tool-policy.md` plus three vendor configs). The PR checklist in
  `docs/standards/pull-requests.md` enumerates them, so a reviewer can see at
  a glance whether one was forgotten.
- The cost of this model is honest: three hand-maintained permission files
  can still drift between PRs. Nothing mechanically prevents it yet, which is
  why the source of truth stays prose-binding and the matrix records real
  enforcement strength per file rather than claiming flat parity.
- `pull_request_knowledge_governance.yml` adds a small CI job to layer-one
  PRs (gated by `paths:`, so it does not run on unrelated PRs).
- Onboarding a third vendor is now a defined task: add a column to the role
  map, add a row to the enforcement matrix, commit that vendor's config files
  and an MCP template.

## Follow-up — not yet decided

- **Widen the Claude Code deny patterns to match Cursor's coverage.**
  `.cursor/cli.json` uses `Shell(terraform:*apply*)`, which also catches
  `terraform -chdir=… apply`; `.claude/settings.json` uses
  `Bash(terraform apply*)`, which does not match that form. Until reconciled,
  Cursor is the stricter of the two. Needs a deliberate permission change,
  reviewed by a human.
- **Confirm `.cursor/permissions.json` tolerates `//` comments.** The file is
  currently JSONC. If Cursor parses it as strict JSON, the comment must move
  out or the file silently fails to load — verify before relying on it.
- **No automated parity or drift check exists.** `compare_gaps`
  (`tools/knowledge-mcp/src/knowledge/gaps.py`) diffs an external consumer
  repo's manifest against `data/reference.yaml`; it cannot diff this repo's
  vendor files against each other or against `tool-policy.md`. Candidates:
  generate the vendor files (see Alternatives) or add a CI check that asserts
  the three permission files encode the same rule set.
- **Cursor has no committed subagent/command equivalent** to
  `.claude/agents/*.md` and `.claude/commands/*.md`. The role map records the
  hole; whether to fill it depends on whether the team runs multi-agent
  workflows through Cursor.

## References

- `agents/shared/context/tool-policy.md` — autonomy boundary and enforcement
  matrix
- `.claude/settings.json`, `.cursor/cli.json`, `.cursor/permissions.json` —
  the vendor permission files this ADR keeps at parity
- `docs/standards/pull-requests.md` — "Changing a shared AI-agent convention"
  checklist
- `.github/workflows/pull_request_knowledge_governance.yml`
- `docs/adr/0001-makefile-unified-cli-facade.md` — same pattern (name a
  shared convention once, point every adapter at it) applied earlier to the
  Makefile facade

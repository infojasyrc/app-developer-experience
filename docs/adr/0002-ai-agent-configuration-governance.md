# ADR 0002: AI Agent Configuration Governance

- Status: Accepted
- Date: 2026-09-18
- Deciders: ADE platform
- Tags: claude-code, cursor, knowledge-mcp, conventions, permissions

## Context

This monorepo is read by more than one AI coding tool: Claude Code
(`CLAUDE.md`, `.claude/`) and Cursor (`.cursor/`), plus a vendor-neutral
`AGENTS.md`. Each reads a different, tool-specific config format, so the same
convention (a path, a Make target, a coverage threshold, a permission) can be
written down more than once and drift — one vendor's file gets updated, the
other doesn't, and an agent reading the stale one acts on outdated
information.

Two concrete instances of this existed at the time of this decision:

- **Tool permissions had no shared source or cross-vendor parity.**
  `.claude/settings.json` enforces a Bash allow/deny list — it blocks
  `terraform apply/destroy`, `make destroy*`, and `make bootstrap-all*`
  outright, before the harness runs them. Cursor had no equivalent, and
  nothing recorded that gap; a reviewer had no way to tell, from the repo,
  whether that guardrail applied when an agent worked through Cursor instead
  of Claude Code.
- **MCP client bootstrapping was not at parity.** Cursor had a committed
  `.cursor/mcp.json.example` for the `ade-knowledge` server. Claude Code had
  no equivalent, so a Claude Code user had to hand-build the config from
  documentation instead of copying a ready file.

Content conventions already had a working pattern for this problem: facts
live once in `agents/shared/context/*.md`, and `CLAUDE.md`, `AGENTS.md`, and
`.cursor/rules/000-core.mdc` point to them instead of copying them, with
`tools/knowledge-mcp` ingesting those same sources to answer
`get_convention`. That pattern had never been extended to permissions or to
MCP client config, and nothing enforced it in CI.

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
   boundary — what an agent may run without asking — is written once in
   `agents/shared/context/tool-policy.md`, including an explicit enforcement
   matrix per vendor. `.claude/settings.json` is the only vendor with real,
   harness-enforced permissions today; Cursor's equivalent is advisory text
   in `.cursor/rules/000-core.mdc`. That asymmetry is documented, not hidden.
4. **MCP client config has one template per vendor.** `.cursor/mcp.json.example`
   (existing) and `.mcp.json.example` (new, root) both wrap the same
   `ade-knowledge` Docker command; only the file location and wrapper key
   differ, per `tools/knowledge-mcp/README.md`'s client table.
5. **`knowledge-mcp` ingestion runs in CI on every PR that touches a
   knowledge source.** `.github/workflows/pull_request_knowledge_governance.yml`
   runs `make sync`, so a file that breaks ingestion (bad frontmatter,
   malformed headings) fails CI instead of silently degrading
   `get_convention`. This checks that the sources still parse — it does not
   check that `CLAUDE.md` and `.cursor/rules/000-core.mdc` still agree with
   each other semantically. No tool in this repo does that today (see
   Follow-up).

## Alternatives considered

### Extend the existing shared-context pattern to permissions (chosen)

Reuses a pattern already proven for content conventions. One new file
(`tool-policy.md`) plus a documented enforcement matrix, instead of a new
mechanism.

### Duplicate the permission rule independently in each vendor's file

Rejected: this is the exact failure mode the shared-context pattern exists to
prevent. Two independently-maintained copies of "never run `terraform
destroy` unattended" drift the same way two independently-maintained copies
of a path or a Make target would.

### Wait for Cursor to ship an enforced, version-controlled command
allow/deny mechanism before addressing this at all

Rejected: the asymmetry is a live gap today — undocumented, it is
indistinguishable from an oversight. Documenting it now (§3, the enforcement
matrix) costs one file and gives reviewers something concrete to check;
waiting leaves the gap silent indefinitely with no forcing function to close
it later.

## Consequences

- A convention change now touches at most: the one shared-context/standards
  file, and — only if the change is core or permission-related — a one-line
  pointer update in the adapters. It should never require editing the same
  paragraph in three places.
- Permission changes are reviewable: `.claude/settings.json` and
  `tool-policy.md` are expected to move together in the same PR, so a
  reviewer can catch a denial that was loosened without the rationale
  changing.
- `pull_request_knowledge_governance.yml` adds a small CI job to knowledge-
  source PRs (git-gated by `paths:`, so it does not run on unrelated PRs).

## Follow-up — not yet decided

- **Cursor has no committed, harness-enforced command allow/deny mechanism
  in this repo.** This ADR documents that gap; it does not close it. If
  Cursor's plan or version later adds one, extend `tool-policy.md`'s
  enforcement matrix and wire it the same way `.claude/settings.json` is
  wired — do not assume parity exists before that mechanism is confirmed.
- **No tool checks semantic agreement between adapters.** `compare_gaps`
  (`tools/knowledge-mcp/src/knowledge/gaps.py`) diffs an external consumer
  repo's manifest against `data/reference.yaml` — it has no capability to
  diff `CLAUDE.md` against `.cursor/rules/000-core.mdc`. Until such a check
  exists (or is deliberately ruled out as not worth building), semantic
  agreement stays a human review step via the PR checklist in
  `docs/standards/pull-requests.md`.

## References

- `agents/shared/context/tool-policy.md`
- `.claude/settings.json`
- `.cursor/rules/000-core.mdc`
- `docs/standards/pull-requests.md` ("Changing a shared AI-agent convention")
- `.github/workflows/pull_request_knowledge_governance.yml`
- `docs/adr/0001-makefile-unified-cli-facade.md` — same pattern (name a
  shared convention once, point every adapter at it) applied earlier to the
  Makefile facade

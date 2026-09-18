# Pull Request Process

## PR Structure

As part of our definition of done and team agreements, when a developer
submits changes and creates a pull request, it should follow:

Manual process: complete the pull request description using the fields in
[.github/pull_request_template.md](../../.github/pull_request_template.md).
Description of all changes must be short and concise.

## Work In Progress

To maximize visibility of progress as a team, use one of:

- The `WIP` prefix on the pull request title
- A draft pull request

## PR Automation

TODO: As a team, look for a way to automate this process using the GitHub CLI.

## Changing a shared AI-agent convention

This monorepo keeps one fact per convention in `agents/shared/context/*.md`,
`docs/standards/`, or `docs/adr/`, and treats `CLAUDE.md`, `AGENTS.md`, and
`.cursor/rules/*.mdc` as thin adapters that point at those files instead of
restating them (see
[`docs/analysis/genai-vendor-config-governance.md`](../analysis/genai-vendor-config-governance.md)
and
[`docs/adr/0002-ai-agent-configuration-governance.md`](../adr/0002-ai-agent-configuration-governance.md)).
If your PR changes a convention an agent reads — a path, a Make target, a
coverage threshold, a permission, a naming rule — go through this checklist
before requesting review, in addition to the standard PR structure above:

- [ ] The fact changed in `agents/shared/context/*.md` (or `docs/standards/`,
      `docs/adr/`) — not inline in `CLAUDE.md` or a `.cursor/rules/*.mdc`
      file.
- [ ] If it's a core, repo-wide fact: `CLAUDE.md`, `AGENTS.md`, and
      `.cursor/rules/000-core.mdc` still summarize it at the same level of
      detail (they should only need a pointer to still be correct, not a
      content rewrite — if they need a content rewrite, the fact probably
      leaked back into the adapter).
- [ ] If it's component-scoped: the matching `.cursor/rules/<component>.mdc`
      glob still matches and its summary isn't stale.
- [ ] If it's a tool-permission/guardrail change (what an agent may run
      autonomously): updated `agents/shared/context/tool-policy.md` **and**
      `.claude/settings.json`'s `allow`/`deny` lists in the same PR — they
      must never drift from each other. Cursor has no enforced equivalent
      today (see the enforcement matrix in `tool-policy.md`); update the
      advisory note in `.cursor/rules/000-core.mdc` if it would otherwise
      contradict the new rule.
- [ ] `.github/workflows/pull_request_knowledge_governance.yml` passes
      (rebuilds the `knowledge-mcp` index from the changed sources — catches
      a source file that no longer parses, not semantic disagreement between
      files).

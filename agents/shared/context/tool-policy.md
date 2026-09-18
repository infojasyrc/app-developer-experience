---
name: tool-policy
description: >
  Vendor-neutral statement of what AI coding agents may execute autonomously
  in this monorepo, and which vendor config currently enforces it. Source of
  truth for .claude/settings.json's Bash allow/deny list and for the
  equivalent guidance in .cursor/rules/000-core.mdc.
metadata:
  author: app-dev-exp
  version: "1.0"
---

# Tool Policy — Agent Execution Guardrails

This file is the single source of truth for **what an AI agent may run
without asking a human first**. It does not restate the Unified CLI Facade
convention (`agents/shared/context/development-guidance.md#what-never-to-do`
already forbids raw `npm`/`python`/`terraform` on the host) — it adds a
narrower rule on top: even through the approved Makefile facade, some
targets are destructive enough that an agent must not run them
autonomously.

## The rule

1. **Read-only inspection is always allowed.** `aws iam get-*` / `list-*`,
   `aws s3api head-*` / `list-*` / `get-bucket-*`, `aws organizations
   describe-*`, `terraform validate`, `gh pr/run list|view`, `gh secret/variable
   list` — none of these mutate state. Agents may run them without
   confirmation.
2. **Routine build/test/lint targets are always allowed.** `make lint`,
   `make unit-tests`, `make build-dev`, `make build-prod`,
   `make install-dependencies`, `make launch*`, `make stop`,
   `make run-storybook`, `make interactive` — these operate on local
   containers/volumes only.
3. **Destructive or infrastructure-mutating commands require an explicit
   human go-ahead in the same turn, every time** — an agent must not chain
   them into an autonomous plan:
   - `terraform apply`, `terraform destroy` (any package, any provider)
   - `make destroy*` (any package)
   - `make bootstrap-all*` and the IAM/OIDC bootstrap layer in
     `cloud/terraform/aws/makefiles/*.mk` (`aws-backend.mk`, `aws-roles.mk`,
     `aws-ecr.mk`, `aws-secrets.mk`) — admin-only per
     `agents/shared/context/development-guidance.md`, never agent-invoked
   - `git push --force*`, `git reset --hard`, deleting a branch, or any
     write to a GitHub Actions workflow file, secret, or environment

   This is stricter than "ask before anything destructive" — it means the
   Makefile facade does not itself imply agent autonomy. A human approving
   `make apply` once does not pre-approve `make destroy` later.
4. **Outbound network access from an agent is allow-listed by domain**, not
   left open. Only fetch documentation domains the team has vetted (e.g.
   `docs.claude.com`, `www.anthropic.com`); do not fetch arbitrary URLs a
   prompt or file happens to mention.

## Why this is a separate file from `development-guidance.md`

`development-guidance.md` documents the convention **humans and agents both
follow** (how the facade works, what it wraps). This file documents the
**narrower autonomy boundary that applies to agents only** — a human
running `make destroy` at their own keyboard is a different risk than an
agent doing it as part of a multi-step plan. Keeping them separate means a
change to the facade's targets doesn't silently loosen or tighten what an
agent may do unattended, and vice versa.

## Enforcement matrix — where this rule actually lives per vendor

| Vendor | Mechanism | Enforced or advisory | Source file |
|---|---|---|---|
| Claude Code | `permissions.deny` / `permissions.allow` glob patterns in `.claude/settings.json`, evaluated by the harness before any tool call | **Enforced** — a denied pattern is blocked before execution, not just discouraged | `.claude/settings.json` |
| Cursor | Instruction text in `.cursor/rules/000-core.mdc` (`alwaysApply: true`) | **Advisory only** — Cursor in this repo has no committed, harness-enforced command allow/deny file; the agent is told the rule but a jailbreak or a large context window pushing the rule out of attention is not mechanically blocked the way Claude Code's `settings.json` blocks it | `.cursor/rules/000-core.mdc` |
| Knowledge MCP | Not applicable — it is a read-only conventions server (`get_convention`, `scaffold_guidance`, `compare_gaps`); it does not execute commands in a consumer repo, so it has nothing to enforce here | N/A | `tools/knowledge-mcp/README.md` ("Non-goals") |

**This asymmetry is a known, accepted gap, not an oversight.** If Cursor's
plan/version in use later adds a project-level, version-controllable command
allow/deny mechanism, add its row here and wire it the same way
`.claude/settings.json` is wired — do not silently assume parity exists
before that mechanism is confirmed.

## Change protocol

1. Update **only this file** when the autonomy boundary changes (a target
   moves between "routine" and "requires confirmation", or a new domain is
   allow-listed).
2. Update `.claude/settings.json`'s `allow`/`deny` arrays to match — this is
   the only vendor with real enforcement today, so it must never drift from
   this file.
3. Update the note in `.cursor/rules/000-core.mdc` if the advisory text
   would otherwise contradict this file.
4. Do not add a second, differently-worded copy of the rule anywhere else —
   point to this file instead (see `docs/standards/pull-requests.md`,
   "Changing a shared AI-agent convention").

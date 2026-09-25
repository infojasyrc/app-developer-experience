---
name: tool-policy
description: >
  Vendor-neutral statement of what AI coding agents may execute autonomously
  in this monorepo, and how each vendor enforces it. Source of truth for
  .claude/settings.json, .cursor/cli.json, and .cursor/permissions.json, and
  for the prose reinforcement in CLAUDE.md and .cursor/rules/000-core.mdc.
metadata:
  author: app-dev-exp
  version: "2.0"
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

Each vendor expresses this same rule in its own syntax, in its own folder.
All three files below are committed and reviewed together; none of them is
allowed to define a rule this file doesn't state.

| Vendor surface | Mechanism | Enforcement strength | Source file |
|---|---|---|---|
| Claude Code | `permissions.allow` / `permissions.deny` patterns evaluated by the harness before any tool call | **Mechanical** — a denied pattern is blocked before execution | `.claude/settings.json` (plus `settings.local.json` for personal additions, gitignored) |
| Cursor CLI (`cursor-agent`) | `permissions.allow` / `permissions.deny` with `Shell(<tool>:<args>)` patterns | **Mechanical** — same model as Claude Code, different pattern syntax | `.cursor/cli.json` |
| Cursor IDE | `terminalAllowlist` (prefix-matched commands eligible for auto-run) plus `autoRun.block_instructions` | **Mixed** — the allowlist is mechanical; `block_instructions` are natural-language and therefore model-mediated, so treat them as reinforcement for the allowlist, never as the only barrier | `.cursor/permissions.json` |
| Both vendors, prose reinforcement | Instruction text an agent reads as context | Advisory — redundant with the files above by design, so a model that never consults a config file still sees the rule | `CLAUDE.md`, `.cursor/rules/000-core.mdc` |
| Knowledge MCP | Not applicable — read-only conventions server (`get_convention`, `scaffold_guidance`, `compare_gaps`); it does not execute commands, so it has nothing to enforce | N/A | `tools/knowledge-mcp/README.md` ("Non-goals") |

### Known coverage difference between the vendor files

The deny lists are equivalent in intent but not in matching power, because
the two pattern syntaxes differ:

- `.cursor/cli.json` uses leading wildcards (`Shell(terraform:*apply*)`), so
  it also catches flag-prefixed forms such as
  `terraform -chdir=cloud/terraform/aws apply`.
- `.claude/settings.json` uses prefix patterns (`Bash(terraform apply*)`),
  which match a command that *begins* with `terraform apply`. The
  `-chdir=… apply` form is not matched by that pattern.

Until the Claude Code patterns are widened to match, `.cursor/cli.json` is
the stricter of the two. Treat rule 3 above as binding regardless of what any
one pattern happens to catch: the config files are a safety net for the rule,
not a definition of it.

## Change protocol

1. Update **only this file** when the autonomy boundary changes (a target
   moves between "routine" and "requires confirmation", or a new domain is
   allow-listed).
2. Update every vendor file in the same PR so they cannot drift:
   `.claude/settings.json`, `.cursor/cli.json`, and `.cursor/permissions.json`.
   A rule added to one and forgotten in the others is the failure mode this
   file exists to prevent.
3. Update the prose reinforcement in `CLAUDE.md` and
   `.cursor/rules/000-core.mdc` only if it would otherwise contradict this
   file — they summarize, they do not redefine.
4. Do not add a second, differently-worded copy of the rule anywhere else —
   point to this file instead (see `docs/standards/pull-requests.md`,
   "Changing a shared AI-agent convention").
5. When a new AI vendor is adopted, add a row to the matrix above and wire
   its config file the same way. Do not assume a vendor enforces anything
   until its mechanism is confirmed and committed.

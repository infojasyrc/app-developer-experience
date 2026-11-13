# GenAI Vendor Configuration: CLAUDE.md / .claude/ vs .cursor/ — Governance Analysis

- Status: Analysis — implemented. Decisions promoted to
  [`docs/adr/0002-ai-agent-configuration-governance.md`](../adr/0002-ai-agent-configuration-governance.md).
- Date: 2026-09-17 (analysis), implemented 2026-09-18
- Author: infojasyrc@gmail.com (with Claude Code)
- Audience: software architects/maintainers of this monorepo's AI-agent tooling

> **Correction from the original analysis**: §4.3 originally proposed wiring
> `compare_gaps` into CI as a drift detector between `CLAUDE.md`, `AGENTS.md`,
> and `.cursor/rules/*.mdc`. Reading `tools/knowledge-mcp/src/knowledge/gaps.py`
> during implementation showed `compare_gaps(target_repo_manifest)` diffs an
> **external consumer repo's** manifest against `data/reference.yaml` — it has
> no capability to compare ADE's own adapter files against each other. The
> shipped CI gate instead runs `make sync` (rebuilds the knowledge index from
> `knowledge/ingest.py`'s `SOURCE_FILES` + `.cursor/rules/*.mdc`) on any PR
> touching those sources. That proves ingestion still parses; it does not
> prove semantic agreement between adapters — that stays a manual review step
> (see the PR checklist below). Recommendation #1's table row is corrected
> accordingly.

## 1. Question, answered up front

1. **Do you need to keep both `.claude/` and `.cursor/` (plus `CLAUDE.md` and `AGENTS.md`)?**
   Yes. They are not duplicates of the same thing — they are two different products' *loading mechanisms* for the same underlying knowledge, plus one vendor-neutral layer. Deleting either breaks that tool's users. See §2–3.
2. **How do you maintain both without them drifting apart?**
   Keep exactly one source of truth per fact (`agents/shared/context/*.md`, `docs/adr/`, `docs/standards/`), and treat `CLAUDE.md`, `AGENTS.md`, and `.cursor/rules/*.mdc` as thin, vendor-specific *adapters* that point at that source instead of restating it. This repo already does this for content; it does **not** yet do it for tool permissions. See §4.
3. **How do you keep shared rules and permissions reusable across both?**
   Rules: already solved (§4). Permissions: not solved yet — `.claude/settings.json` allow/deny has no Cursor equivalent and no shared source; this is the main gap this analysis found. See §5.

---

## 2. What each artifact actually is

These are not interchangeable file formats — each is read by a different program, at a different scope, with different mechanics.

| Artifact | Read by | Scope mechanism | Contains |
|---|---|---|---|
| `CLAUDE.md` (root) | Claude Code | Loaded once per session at repo root; nested `CLAUDE.md` files load by directory when Claude reads/edits inside them | Narrative project memory: solutions, paths table, architecture concepts, Make targets |
| `AGENTS.md` (root) | Any tool that supports the emerging cross-vendor `AGENTS.md` convention (Claude Code, Codex-style tools, and — per this repo's own rule file — referenced by Cursor too) | Loaded once, vendor-neutral | Agent index: orchestration rules, agent roster, shared-context reading order, handoff protocol |
| `.claude/settings.json` / `settings.local.json` | Claude Code only | Project + local (gitignored) layers, merged | **Tool permissions** — Bash allow/deny patterns, WebFetch domain allowlist |
| `.claude/agents/*.md`, `.claude/commands/*.md` | Claude Code only | Explicit invocation (`Agent` tool, `/debug-pipeline`) | Subagent definitions, slash commands |
| `.cursor/rules/*.mdc` | Cursor only | Per-file `globs` + `alwaysApply` front-matter — Cursor auto-attaches a rule when you touch a matching path | Directory-scoped conventions (`backend.mdc` only fires inside `backend/**`, etc.) |
| `.cursor/mcp.json` | Cursor only (gitignored; `.example` is the committed template) | Project-level MCP client config | `ade-knowledge` MCP server wiring |
| `agents/shared/context/*.md` | Nothing directly — these are **data**, not a vendor's native config | Read explicitly by CLAUDE.md's instruction, AGENTS.md's instruction, and `.cursor/rules/000-core.mdc`'s instruction; also ingested by `tools/knowledge-mcp` | The actual facts: paths, commit conventions, dev guidance, AWS map |

Key structural point: **`.cursor/rules` has a scoping primitive Claude Code's flat `CLAUDE.md` doesn't (glob-based auto-attach)**, and **Claude Code has two primitives Cursor doesn't have in this repo** (versioned, enforceable tool permissions via `settings.json`, and first-class subagents/commands via `.claude/agents` and `.claude/commands`). Neither tool can read the other's native format. That asymmetry is why both folders exist — this isn't legacy cruft, it's two different capability sets you're actually using (permission gating for Claude, glob-scoped rule injection for Cursor).

---

## 3. Current state in this repo (inventory)

```
CLAUDE.md                              # Claude Code root memory
AGENTS.md                              # vendor-neutral agent index
.claude/
├── settings.json                      # Bash/WebFetch allow+deny (versioned, shared with team)
├── settings.local.json                # personal additions (gitignored)
├── agents/*.md  (3)                   # infra-planner, infra-developer, pipeline-debugger
└── commands/debug-pipeline.md         # /debug-pipeline slash command
.cursor/
├── rules/000-core.mdc                 # alwaysApply:true — mirrors CLAUDE.md's core section
├── rules/{backend,cli,cloud,conference-manager,devops,knowledge-mcp,mobile-app}.mdc
│                                       # glob-scoped, alwaysApply:false
├── mcp.json                           # gitignored, real path
└── mcp.json.example                   # committed template
agents/shared/context/
├── monorepo-paths.md                  # canonical paths + cm-* aliases  ← single source of truth
├── commit-conventions.md
├── development-guidance.md            # Unified CLI Facade, container-first, host-Terraform-for-IaC
└── aws-infrastructure-map.md
tools/knowledge-mcp/                   # runtime MCP server that ingests CLAUDE.md + AGENTS.md +
                                        # .cursor/rules/*.mdc + development-guidance.md, and answers
                                        # get_convention / scaffold_guidance / compare_gaps
docs/adr/0001-makefile-unified-cli-facade.md   # names the "Unified CLI Facade" term once, for all consumers
```

This is already a deliberate three-layer design, not an accident:

1. **Layer 1 — facts**: `agents/shared/context/*.md`, `docs/standards/*.md`, `docs/adr/*.md`. Vendor-agnostic markdown. Nothing here knows Claude or Cursor exist.
2. **Layer 2 — adapters**: `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/000-core.mdc`. Each restates the *table of contents* and tells the tool to go read Layer 1 (`CLAUDE.md`: "See `agents/shared/context/monorepo-paths.md`"; `000-core.mdc`: "Mandatory context, do not duplicate it here: always read @AGENTS.md and @CLAUDE.md"; `AGENTS.md`: "Before starting any task, all agents MUST read: `cat agents/shared/context/*.md`").
3. **Layer 3 — enforcement**: `tools/knowledge-mcp`. Its own README states the rule explicitly: *"Do not teach the MCP a second copy of the rule. Ingestion re-reads those files."* `ingest()` re-parses Layer 2 on every `make sync`, so `get_convention` never serves a second, hand-copied version of a rule. `compare_gaps` is a separate capability — it diffs an *external consumer repo's* manifest against `data/reference.yaml`, not ADE's own adapters against each other (see the correction note above).

This pattern is correct and worth keeping. The gap is that it only covers **content conventions**, not **tool permissions/capabilities** — see §5.

---

## 4. How to maintain both folders without drift

Treat this as three concrete rules, all already implied by the repo's existing structure — make them explicit and enforce them in review:

1. **One fact, one file.** Any statement that's true regardless of which AI tool reads it (a path, a Make target, a coverage threshold, a naming convention) lives in `agents/shared/context/`, `docs/standards/`, or `docs/adr/` — never inline in `CLAUDE.md` or a `.mdc` file. `000-core.mdc` already says this ("Mandatory context, do not duplicate it here"); apply the same discipline to *every* `.cursor/rules/*.mdc` and to `CLAUDE.md` itself, not just the core file. Today `backend.mdc`, `cloud.mdc`, etc. still restate some content that overlaps with `development-guidance.md` (e.g. container-first, coverage %) — acceptable as a short *pointer + one-line summary*, but watch for it growing into a second copy of the rule.
2. **Vendor adapters stay thin and diverge only on mechanics.** `CLAUDE.md` differs from `.cursor/rules/000-core.mdc` in *format* (flat doc vs. front-matter + globs) and in *tool-specific workflow* (Claude's Plan→Implement→`docs/plans/*.md` loop is Claude-specific and correctly lives only in `CLAUDE.md`/`000-core.mdc`, not in `AGENTS.md`). That's fine — mechanics are allowed to diverge; facts are not.
3. **Run `knowledge-mcp`'s ingestion in CI as a health check, not just on demand.** `make sync` (`knowledge.sync` → `ingest()` → `KnowledgeStore.save`) already exists and already fails loudly on malformed frontmatter or a missing source file. Right now nothing forces it to run when someone edits `agents/shared/context/*.md` or `.cursor/rules/*.mdc`. Add a CI job that runs `make sync` on every PR touching those paths, so a source file that breaks parsing fails the build instead of silently degrading `get_convention`. This is real but narrower than a full drift check: it proves the sources still parse, not that `CLAUDE.md` and `.cursor/rules/000-core.mdc` still agree — that stays a human review step (the checklist below). Implemented as `.github/workflows/pull_request_knowledge_governance.yml`.

**PR checklist to adopt** (for anyone changing a convention, not just a code path):

- [ ] Updated the fact in `agents/shared/context/*.md` (or `docs/standards/`, `docs/adr/`) — not in `CLAUDE.md`/`.mdc` directly.
- [ ] If the fact is core (applies repo-wide), confirm `CLAUDE.md`, `AGENTS.md`, and `.cursor/rules/000-core.mdc` still describe it at the same level of summary (they should not need a content edit if step 1 was done right — only if the *pointer* itself moved).
- [ ] If the fact is component-scoped, confirm the matching `.cursor/rules/<component>.mdc` glob still matches and its one-line summary isn't stale.
- [ ] Ran `make sync` (or let `pull_request_knowledge_governance.yml` do it) against `tools/knowledge-mcp` — this only proves the sources still parse, not that the adapters still agree; confirm that by reading them.

---

## 5. Reusable shared rules and permissions — what's solved vs. not

### 5.1 Rules (content) — solved, keep doing this

The `agents/shared/context/` + adapter-pointer + `knowledge-mcp` pattern from §3–4 **is** the reusable-rules mechanism. Nothing new needed here beyond the CI enforcement in §4.3.

### 5.2 Permissions — not solved, this is the actual gap

`.claude/settings.json` encodes a real security/governance decision:

```json
"allow": ["Bash(aws iam get-role *)", "Bash(make lint)", "Bash(make build-dev)", ...],
"deny":  ["Bash(terraform apply*)", "Bash(terraform destroy*)", "Bash(make destroy*)", "Bash(make bootstrap-all*)"]
```

This is read-only-by-default for AWS/Terraform, and explicitly blocks destructive `apply`/`destroy`/`bootstrap-all`. **This policy exists only for Claude Code.** Cursor has no committed file anywhere in this repo that expresses "never let the agent run `terraform apply`" — Cursor's own permission/allowlist model lives in editor/user settings, not in a repo-committed `.mdc` file, so today it is not version-controlled, not reviewable in a PR, and not guaranteed to match Claude's guardrail. If someone tightens or loosens the Claude allow/deny list, nothing tells the Cursor user (or the next engineer configuring their own Cursor client) that the equivalent guardrail also needs to change.

Two consequences worth flagging explicitly to the team:

- **Silent divergence risk**: the `deny` list is the actual safety boundary preventing an agent from running `terraform destroy` against real infra. It living in exactly one vendor's config file means that boundary is enforced for Claude Code users and *not* enforced for Cursor users of the same repo.
- **`knowledge-mcp` doesn't ingest it**: the README's ingestion list is `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*.mdc`, `development-guidance.md` — `.claude/settings.json` is out of scope by design (it's a permissions file, not a convention doc), so `compare_gaps` cannot and will not catch this drift. This has to be a manual/CI check, not something the existing MCP surface already covers.

**Recommendation**: add a vendor-neutral policy source and treat both vendor files as generated/reviewed-together artifacts, mirroring exactly the pattern already used for content:

```
agents/shared/context/tool-policy.md      # NEW — vendor-neutral statement of the rule:
                                           #   "agents may read AWS/Terraform state freely;
                                           #    agents must never run terraform apply/destroy,
                                           #    make destroy*, or make bootstrap-all* without a
                                           #    human in the loop" — with the *why* (blast radius),
                                           #    not just the *what*.
.claude/settings.json                     # Claude adapter: encodes the same rule as allow/deny patterns
<cursor equivalent, once decided>         # Cursor adapter: encodes the same rule in whatever
                                           #   mechanism the team's Cursor version/plan supports
                                           #   (project rule text instructing the agent not to run
                                           #   these commands, and/or an editor-level command
                                           #   allowlist configured per-seat)
```

If Cursor in this org's plan has no enforceable, version-controllable command-permission primitive equivalent to `.claude/settings.json` (this is a real product-capability gap between the two tools as of today, not a repo-configuration mistake), the honest fallback is: state the guardrail as an instruction in `000-core.mdc` ("never run `terraform apply`/`destroy` or `make destroy*`/`bootstrap-all*` — ask first") knowing it is advisory rather than enforced, and say so in `docs/adr/` so the team doesn't assume parity that doesn't exist. Don't let the asymmetry be implicit.

### 5.3 MCP server config — mostly solved, one concrete gap found

`tools/knowledge-mcp/README.md` already documents the multi-client pattern correctly — one Docker `command`/`args` block, reused verbatim across `.cursor/mcp.json`, `.vscode/mcp.json`, and `.agents/mcp_config.json`, differing only in the wrapper key (`mcpServers` vs `servers`+`type:stdio`). That table is exactly the right shape for this problem and should be the template for §5.2 once a Cursor permission mechanism is chosen.

**Gap**: there is no root `.mcp.json` (Claude Code's own project-scoped MCP config file). Cursor users get `ade-knowledge` wired via a committed `.cursor/mcp.json.example`; Claude Code users have no equivalent committed template, so a Claude Code user has to hand-build the config from the README's generic block instead of copying a ready file the way Cursor users do. Given the README already enumerates the exact wrapper differences needed, add a `.mcp.json.example` at root (same `docker run ... stdio_main` args, Claude Code's own top-level `mcpServers` key) alongside the existing `.cursor/mcp.json.example`, and gitignore the real `.mcp.json` the same way `.cursor/mcp.json` is gitignored.

---

## 6. Summary of concrete recommendations — implementation status

| # | Recommendation | Status | Where |
|---|---|---|---|
| 1 | CI gate on PRs touching knowledge/governance sources | **Done, scope corrected** — runs `make sync` (ingestion health check), not a semantic drift check (see correction note above) | `.github/workflows/pull_request_knowledge_governance.yml` |
| 2 | Vendor-neutral statement of what agents may/may not execute | **Done** | `agents/shared/context/tool-policy.md`, indexed in `agents/shared/context/monorepo-paths.md` |
| 3 | Document Cursor's equivalent enforcement (or its absence) | **Done — documented as absent (advisory only)**, per the enforcement matrix in `tool-policy.md` | `.cursor/rules/000-core.mdc` (pointer), `CLAUDE.md` (pointer) |
| 4 | Root `.mcp.json.example` + gitignore real `.mcp.json` | **Done** | `.mcp.json.example`, `.gitignore`, `tools/knowledge-mcp/README.md` client table |
| 5 | PR checklist for convention changes | **Done** | `docs/standards/pull-requests.md`, "Changing a shared AI-agent convention" |
| 6 | Finish the stub `.cursor/rules/cli.mdc` | **Done — filled in** (kept; `cli/` is a real, shipping Python/Click CLI, not a placeholder) | `.cursor/rules/cli.mdc` |

Also done, beyond the original six: extended `tools/knowledge-mcp` itself so
`tool-policy.md` is queryable through the MCP server like every other
convention (`get_convention("tool-policy" | "permissions" | "guardrails" |
"policy")`) — `src/knowledge/ingest.py` (`SOURCE_FILES`), `src/knowledge/catalog.py`
(`TOPIC_ALIASES`), with matching test coverage in `tests/test_ingest.py` and
`tests/test_get_convention.py`. And the governance model itself was promoted
to `docs/adr/0002-ai-agent-configuration-governance.md` so it persists as a
decision record, not just this analysis.

None of this required removing `.claude/` or `.cursor/` — both remain load-
bearing for the tool they serve. The fix was narrower: extend the governance
pattern this repo already built for *content* (shared source + thin adapters)
to also cover *permissions*, and close two small parity gaps (root MCP
template, stub rule file).

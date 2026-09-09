# ADR 0001: Makefile as Unified CLI Facade

- Status: Accepted
- Date: 2026-09-08
- Deciders: ADE platform
- Tags: makefile, conventions, knowledge-mcp

## Context

Every ADE package is reached through `make help` / `make <target>`. Humans and
agents must not call the underlying tool (`npm`, `python`, `terraform`, `aws`)
by hand. What Make wraps is not the same in every package:

- Services, websites, and runtime tools wrap **Docker** (container-first).
- Infrastructure as Code wraps the **host** Terraform and AWS CLIs.

We needed one name for that shared role. Informal language (“the bridge”) is
accurate as a metaphor and weak as a convention: Knowledge MCP, Cursor rules,
and agents cannot treat a metaphor as a stable term.

Four candidate names were evaluated.

## Decision

Use **Unified CLI Facade** as the standard term.

- Human form: “The Makefile is the Unified CLI Facade.”
- Core-rule heading: `Core Rule: Makefile Is the Unified CLI Facade`
- Knowledge MCP topic stays `makefile` (stable lookup). Aliases:
  `make`, `make-targets`, `unified-cli-facade`, `cli-facade`.
- Operational rules remain in `agents/shared/context/development-guidance.md`.
  This ADR is the decision record, not a second copy of those rules.

“Facade” is the [Gang of Four](https://en.wikipedia.org/wiki/Facade_pattern)
pattern: a single higher-level interface over a subsystem. “CLI” names the
interface developers and agents actually type. “Unified” is the ADE-specific
constraint: the same facade covers two different subsystems (containerized
language runtimes and host Terraform). Callers talk only to Make. They do not
need to know which backend a target uses.

## Alternatives considered

### Unified CLI Facade (chosen)

- Standard pattern name (Facade), applied to a command-line entry point.
- “Unified” states why services and IaC share one interface after we split
  container-first from IaC.
- Encodes a **contract**: going around the facade is a convention violation,
  not a shortcut.

### Task Runner Abstraction Layer

- Make is a task runner. The phrase is familiar.
- “Abstraction layer” is not a named pattern; it does not tell an agent what
  is allowed.
- “Task runner” usually means optional convenience (`npm scripts`, `just`).
  ADE Make is mandatory. The name undersells the policy.

### Local Task Harness

- “Harness” fits test or execution wrappers that invoke and observe a binary.
- “Local” is too narrow. This is the org contract for humans, agents, and
  package workflows — not only a laptop helper.
- Not a widely used architecture term for a public CLI.

### Task Execution Facade

- Also a Facade, so pattern-correct.
- Weaker: it does not stress unification across package types, which is the
  decision that made a shared name necessary.
- “Task execution” collides with job queues and workflow engines.

## Consequences

- Docs, Cursor rules, and Knowledge MCP say **Unified CLI Facade**, not
  “bridge”, when they mean the shared Make contract.
- `get_convention("makefile")` and `get_convention("unified-cli-facade")`
  return the same shared rule. `get_convention("container-first")` stays
  services-only. `get_convention("iac")` stays host Terraform via Make.
- New packages still ship a Makefile. What the facade wraps is defined by
  package type (Docker vs host CLI), not by a second entry point.
- Informal “bridge” language in older chat or plans should be read as this
  term.

## References

- Operational rule: `agents/shared/context/development-guidance.md`
- Knowledge MCP topics: `tools/knowledge-mcp/src/knowledge/catalog.py`
- GoF Facade: Gamma, Helm, Johnson, Vlissides — *Design Patterns* (1994)

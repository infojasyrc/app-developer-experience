# Tools

To query ADE conventions from another repository, see
[Knowledge MCP](./KnowledgeMCP.md).

## Automation with Makefiles

The Makefile is the **Unified CLI Facade** for every package: `make help`, then
only `make <target>`. What a target wraps depends on the package (Docker for
services, host Terraform for IaC). Decision:
[ADR 0001](./adr/0001-makefile-unified-cli-facade.md).

![Makefile design](./media/tools_makefile_design.png)

## Standardized `project.json` with Nx

Every package's `project.json` wraps its Makefile through Nx (`nx run
<project>:<target>`) using the same contract. See [Nx](./Nx.md) for what
`nx.json` controls, the `project.json` contract, and how to add one to a new
component.

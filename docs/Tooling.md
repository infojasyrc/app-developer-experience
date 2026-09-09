# Tools

To query ADE conventions from another repository, see
[Knowledge MCP](./KnowledgeMCP.md).

## Automation with Makefiles

The Makefile is the **Unified CLI Facade** for every package: `make help`, then
only `make <target>`. What a target wraps depends on the package (Docker for
services, host Terraform for IaC). Decision:
[ADR 0001](./adr/0001-makefile-unified-cli-facade.md).

![Makefile design](./media/tools_makefile_design.png)

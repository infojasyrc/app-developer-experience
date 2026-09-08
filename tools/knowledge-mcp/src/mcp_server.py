from mcp.server.fastmcp import FastMCP

from knowledge.catalog import get_convention, list_resource_uris, read_resource
from knowledge.gaps import compare_gaps
from knowledge.scaffold import scaffold_guidance
from knowledge.store import KnowledgeStore


def build_mcp(store: KnowledgeStore) -> FastMCP:
    mcp = FastMCP("knowledge-mcp")

    @mcp.tool()
    def get_convention_tool(topic: str) -> dict:
        """Return convention excerpts and their source_path for a topic."""
        return get_convention(store, topic)

    @mcp.tool()
    def scaffold_guidance_tool(component_type: str) -> dict:
        """Return which ADE template to copy and the required Make/Docker lifecycle."""
        return scaffold_guidance(component_type)

    @mcp.tool()
    def compare_gaps_tool(target_repo_manifest: dict) -> dict:
        """Report missing or outdated ADE conventions for a target repo manifest."""
        return compare_gaps(target_repo_manifest)

    @mcp.resource("conventions://tech-stack")
    def tech_stack() -> str:
        return read_resource(store, "conventions://tech-stack")

    @mcp.resource("conventions://ddd-clean-architecture")
    def ddd_clean_architecture() -> str:
        return read_resource(store, "conventions://ddd-clean-architecture")

    @mcp.resource("conventions://plan-template")
    def plan_template() -> str:
        return read_resource(store, "conventions://plan-template")

    @mcp.resource("conventions://container-first")
    def container_first() -> str:
        return read_resource(store, "conventions://container-first")

    @mcp.resource("conventions://component/{name}")
    def component(name: str) -> str:
        return read_resource(store, f"conventions://component/{name}")

    mcp.knowledge_store = store
    mcp.list_convention_uris = lambda: list_resource_uris(store)
    return mcp

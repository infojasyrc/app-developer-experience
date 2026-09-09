from knowledge.catalog import get_convention, list_resource_uris, read_resource
from mcp_server import build_mcp


def _joined(result: dict) -> str:
    return "\n".join(item["content"] for item in result["excerpts"])


def test_get_convention_container_first(knowledge_store):
    result = get_convention(knowledge_store, "container-first")
    assert result["topic"] == "container-first"
    assert result["excerpts"]
    joined = _joined(result)
    sources = {item["source_path"] for item in result["excerpts"]}
    assert "agents/shared/context/development-guidance.md" in sources
    assert "build-dev" in joined
    assert "install-dependencies" in joined
    assert "inside containers" in joined.lower() or "container-first" in joined.lower()
    assert "run inside a container via the makefile" not in joined.lower()
    assert "all terraform commands run inside" not in joined.lower()


def test_get_convention_makefile_alias(knowledge_store):
    result = get_convention(knowledge_store, "makefile")
    assert result["topic"] == "makefile"
    joined = _joined(result).lower()
    assert any("development-guidance.md" in item["source_path"] for item in result["excerpts"])
    assert "make help" in joined
    assert "unified cli facade" in joined
    assert "inside containers" in joined
    assert "host" in joined and "terraform" in joined


def test_get_convention_unified_cli_facade_alias(knowledge_store):
    result = get_convention(knowledge_store, "unified-cli-facade")
    assert result["topic"] == "makefile"
    assert result["excerpts"]
    assert "unified cli facade" in _joined(result).lower()


def test_get_convention_make_targets_alias(knowledge_store):
    result = get_convention(knowledge_store, "make-targets")
    assert result["topic"] == "makefile"
    joined = _joined(result).lower()
    assert "never call" in joined or "host" in joined
    assert "make <target>" in joined or "make help" in joined


def test_get_convention_iac_and_terraform_alias(knowledge_store):
    for topic in ("iac", "terraform"):
        result = get_convention(knowledge_store, topic)
        assert result["topic"] == "iac"
        assert result["excerpts"]
        joined = _joined(result).lower()
        assert "terraform" in joined
        assert "host" in joined
        assert "do **not** develop iac inside containers" in joined or "do not develop iac inside containers" in joined
        assert "all terraform commands run inside" not in joined


def test_get_convention_from_claude(knowledge_store):
    result = get_convention(knowledge_store, "tech-stack")
    assert any(item["source_path"] == "CLAUDE.md" for item in result["excerpts"])


def test_get_convention_from_cursor_rule(knowledge_store):
    result = get_convention(knowledge_store, "backend")
    assert any(item["source_path"].endswith(".cursor/rules/backend.mdc") for item in result["excerpts"])


def test_list_resources_includes_contract_uris(knowledge_store):
    uris = list_resource_uris(knowledge_store)
    assert "conventions://tech-stack" in uris
    assert "conventions://ddd-clean-architecture" in uris
    assert "conventions://plan-template" in uris
    assert "conventions://container-first" in uris
    assert "conventions://component/backend" in uris


def test_read_resource_container_first(knowledge_store):
    body = read_resource(knowledge_store, "conventions://container-first")
    assert "development-guidance.md" in body
    assert "build-dev" in body


def test_mcp_registers_get_convention_tool(knowledge_store):
    mcp = build_mcp(knowledge_store)
    assert callable(mcp.list_convention_uris)
    assert "conventions://container-first" in mcp.list_convention_uris()
    result = get_convention(mcp.knowledge_store, "container-first")
    assert result["excerpts"]
    manager = getattr(mcp, "_tool_manager", None)
    tools = getattr(manager, "_tools", None) if manager is not None else None
    if tools:
        assert "get_convention" in tools
        assert "scaffold_guidance" in tools
        assert "compare_gaps" in tools
        assert "get_convention_tool" not in tools

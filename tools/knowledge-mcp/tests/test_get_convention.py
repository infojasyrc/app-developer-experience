from knowledge.catalog import get_convention, list_resource_uris, read_resource
from mcp_server import build_mcp


def test_get_convention_container_first(knowledge_store):
    result = get_convention(knowledge_store, "container-first")
    assert result["topic"] == "container-first"
    assert result["excerpts"]
    joined = "\n".join(item["content"] for item in result["excerpts"])
    sources = {item["source_path"] for item in result["excerpts"]}
    assert "agents/shared/context/development-guidance.md" in sources
    assert "build-dev" in joined
    assert "install-dependencies" in joined


def test_get_convention_makefile_alias(knowledge_store):
    result = get_convention(knowledge_store, "makefile")
    assert result["topic"] == "container-first"
    assert any("development-guidance.md" in item["source_path"] for item in result["excerpts"])


def test_get_convention_make_targets_alias(knowledge_store):
    result = get_convention(knowledge_store, "make-targets")
    assert result["topic"] == "container-first"
    joined = "\n".join(item["content"] for item in result["excerpts"]).lower()
    assert "never call" in joined or "host" in joined


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

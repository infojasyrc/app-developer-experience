from pathlib import Path

import pytest
from ade_core.knowledge.catalog import get_convention

from infrastructure.settings import get_settings
from knowledge import sync
from mcp_server import build_mcp


def _manager(mcp, attr: str) -> dict:
    manager = getattr(mcp, attr, None)
    for name in ("_tools", "_resources", "_templates"):
        found = getattr(manager, name, None)
        if found:
            return dict(found)
    return {}


def test_mcp_registers_tools_and_resources(knowledge_store):
    mcp = build_mcp(knowledge_store)
    assert callable(mcp.list_convention_uris)
    assert "conventions://container-first" in mcp.list_convention_uris()
    assert get_convention(mcp.knowledge_store, "container-first")["excerpts"]
    tools = _manager(mcp, "_tool_manager")
    if tools:
        assert {"get_convention", "scaffold_guidance", "compare_gaps"} <= set(tools)
        assert "get_convention_tool" not in tools


def test_mcp_tools_delegate_to_ade_core(knowledge_store):
    tools = _manager(build_mcp(knowledge_store), "_tool_manager")
    if not tools:
        pytest.skip("FastMCP internals changed")
    assert tools["get_convention"].fn(topic="container-first")["excerpts"]
    assert tools["scaffold_guidance"].fn(component_type="nestjs-gql")["path_alias"] == "NESTJS_GQL"
    assert "gaps" in tools["compare_gaps"].fn(target_repo_manifest={})


def test_mcp_resources_delegate_to_ade_core(knowledge_store):
    mcp = build_mcp(knowledge_store)
    resources = _manager(mcp, "_resource_manager")
    if not resources:
        pytest.skip("FastMCP internals changed")
    for uri in (
        "conventions://tech-stack",
        "conventions://ddd-clean-architecture",
        "conventions://plan-template",
        "conventions://container-first",
    ):
        assert resources[uri].fn()
    templates = getattr(mcp._resource_manager, "_templates", {})
    template = next(iter(templates.values()))
    assert ".cursor/rules/backend.mdc" in template.fn(name="backend")


def test_sync_main(ade_root: Path, tmp_path: Path, monkeypatch: pytest.MonkeyPatch, capsys):
    monkeypatch.setenv("ADE_ROOT", str(ade_root))
    monkeypatch.setenv("INDEX_PATH", str(tmp_path / "knowledge.json"))
    get_settings.cache_clear()
    sync.main()
    get_settings.cache_clear()
    assert "Wrote knowledge index" in capsys.readouterr().out
    assert (tmp_path / "knowledge.json").is_file()

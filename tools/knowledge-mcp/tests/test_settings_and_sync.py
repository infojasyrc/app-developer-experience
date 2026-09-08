from pathlib import Path

import pytest

from infrastructure.settings import Settings, get_settings
from knowledge.bootstrap import load_store
from knowledge.catalog import canonicalize_topic, get_convention, read_resource
from knowledge.ingest import parse_frontmatter, parse_mdc
from knowledge.sync import sync_index


def test_canonicalize_aliases():
    assert canonicalize_topic("Make_Targets") == "container-first"
    assert canonicalize_topic("ddd") == "ddd-clean-architecture"
    assert canonicalize_topic("plan") == "plan-template"


def test_get_convention_unknown_topic(knowledge_store):
    result = get_convention(knowledge_store, "not-a-real-topic")
    assert result["topic"] == "not-a-real-topic"
    assert result["excerpts"] == []


def test_read_resource_unknown(knowledge_store):
    body = read_resource(knowledge_store, "conventions://missing")
    assert "No convention records" in body


def test_read_resource_component(knowledge_store):
    body = read_resource(knowledge_store, "conventions://component/backend")
    assert ".cursor/rules/backend.mdc" in body


def test_parse_frontmatter_non_mapping():
    meta, body = parse_frontmatter("---\n- just\n- a\n- list\n---\nbody\n")
    assert meta == {}
    assert "body" in body


def test_parse_mdc_string_glob(tmp_path: Path):
    path = tmp_path / "cli.mdc"
    path.write_text("---\nglobs: cli/**\n---\nplain\n", encoding="utf-8")
    records = parse_mdc(tmp_path, path, path.read_text())
    assert records[0].topic in {"cli", "plain"} or records[0].source_path == "cli.mdc"


def test_settings_resolve_ade_root(ade_root: Path):
    settings = Settings(ADE_ROOT=ade_root)
    assert settings.resolve_ade_root() == ade_root.resolve()


def test_settings_missing_root(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    get_settings.cache_clear()
    monkeypatch.delenv("ADE_ROOT", raising=False)
    settings = Settings(ADE_ROOT=tmp_path)
    with pytest.raises(FileNotFoundError):
        settings.resolve_ade_root()


def test_sync_and_bootstrap_from_index(ade_root: Path, tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    index = tmp_path / "knowledge.json"
    get_settings.cache_clear()
    monkeypatch.setenv("ADE_ROOT", str(ade_root))
    monkeypatch.setenv("INDEX_PATH", str(index))
    get_settings.cache_clear()
    written = sync_index()
    assert written == index
    assert index.is_file()
    get_settings.cache_clear()
    store = load_store()
    assert store.find("container-first")

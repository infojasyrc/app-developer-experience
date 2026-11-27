from pathlib import Path

from ade_core.knowledge.catalog import canonicalize_topic, get_convention, read_resource
from ade_core.knowledge.ingest import parse_frontmatter, parse_mdc


def test_canonicalize_aliases():
    assert canonicalize_topic("Make_Targets") == "makefile"
    assert canonicalize_topic("makefile") == "makefile"
    assert canonicalize_topic("unified-cli-facade") == "makefile"
    assert canonicalize_topic("cli-facade") == "makefile"
    assert canonicalize_topic("container-runtime") == "makefile"
    assert canonicalize_topic("container-engine") == "makefile"
    assert canonicalize_topic("container") == "container-first"
    assert canonicalize_topic("terraform") == "iac"
    assert canonicalize_topic("infrastructure") == "iac"
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


def test_build_index_writes_loadable_store(ade_root: Path, tmp_path: Path):
    from ade_core.knowledge.build import build_index
    from ade_core.knowledge.store import KnowledgeStore

    out = build_index(ade_root, tmp_path / "dist" / "knowledge.json")
    assert KnowledgeStore.load(out).find("container-first")

from pathlib import Path

from knowledge.ingest import ingest, parse_frontmatter, parse_markdown_sections, parse_mdc
from knowledge.models import ConventionRecord
from knowledge.store import KnowledgeStore


def test_parse_frontmatter_extracts_globs():
    text = "---\ndescription: demo\nglobs:\n  - backend/**\n---\n# body\n"
    meta, body = parse_frontmatter(text)
    assert meta["description"] == "demo"
    assert meta["globs"] == ["backend/**"]
    assert body.startswith("# body")


def test_parse_frontmatter_without_marker():
    meta, body = parse_frontmatter("plain text")
    assert meta == {}
    assert body == "plain text"


def test_parse_markdown_sections_splits_headings(tmp_path: Path):
    ade_root = tmp_path
    path = tmp_path / "CLAUDE.md"
    path.write_text("## Alpha\n\nfirst\n\n## Beta\n\nsecond\n", encoding="utf-8")
    records = parse_markdown_sections(ade_root, path, path.read_text(), "claude")
    assert [record.topic for record in records] == ["alpha", "beta"]
    assert records[0].source_path == "CLAUDE.md"
    assert "first" in records[0].content


def test_parse_markdown_without_headings(tmp_path: Path):
    path = tmp_path / "note.md"
    path.write_text("only body", encoding="utf-8")
    records = parse_markdown_sections(tmp_path, path, "only body", "note")
    assert len(records) == 1
    assert records[0].content == "only body"


def test_parse_mdc_uses_filename_topic(tmp_path: Path):
    path = tmp_path / "backend.mdc"
    path.write_text("---\nglobs:\n  - backend/**\n---\n## Architecture\n\nDDD\n", encoding="utf-8")
    records = parse_mdc(tmp_path, path, path.read_text())
    assert records
    assert "backend" in records[0].tags


def test_ingest_real_ade_sources(ade_root: Path):
    records = ingest(ade_root)
    sources = {record.source_path for record in records}
    assert "CLAUDE.md" in sources
    assert "agents/shared/context/development-guidance.md" in sources
    assert any(source.startswith(".cursor/rules/") for source in sources)
    assert any("container-first" in record.tags for record in records)
    assert any("iac" in record.tags for record in records)
    container_first = [record for record in records if "container-first" in record.tags]
    joined = "\n".join(record.content for record in container_first).lower()
    assert "run inside a container via the makefile" not in joined
    terraform_aws = [
        record
        for record in records
        if record.source_path.endswith("development-guidance.md") and "terraform aws" in record.topic.replace("-", " ")
    ]
    assert terraform_aws
    assert all("container-first" not in record.tags for record in terraform_aws)


def test_store_roundtrip(tmp_path: Path):
    record = ConventionRecord(
        topic="demo",
        scope_glob="*",
        source_path="x.md",
        content="hello",
        tags=["demo"],
    )
    store = KnowledgeStore([record])
    path = tmp_path / "index.json"
    store.save(path)
    loaded = KnowledgeStore.load(path)
    assert loaded.records[0].content == "hello"
    assert loaded.find("demo")[0].source_path == "x.md"

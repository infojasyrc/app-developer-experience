"""Build the knowledge index (dist/knowledge.json) from an ADE checkout."""

from __future__ import annotations

from pathlib import Path

from ade_core.knowledge.ingest import ingest
from ade_core.knowledge.store import KnowledgeStore


def build_index(ade_root: Path, out: Path) -> Path:
    out = Path(out)
    KnowledgeStore(ingest(Path(ade_root))).save(out)
    return out

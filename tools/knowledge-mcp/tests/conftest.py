import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

src_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
sys.path.insert(0, src_path)

from infrastructure.settings import get_settings  # noqa: E402
from knowledge.ingest import ingest  # noqa: E402
from knowledge.store import KnowledgeStore  # noqa: E402


def _find_ade_root() -> Path | None:
    env = os.environ.get("ADE_ROOT")
    if env and Path(env, "CLAUDE.md").exists():
        return Path(env)
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / "CLAUDE.md").exists() and (parent / "agents/shared/context/development-guidance.md").exists():
            return parent
    return None


@pytest.fixture
def ade_root() -> Path:
    root = _find_ade_root()
    if root is None:
        pytest.skip("ADE_ROOT not available")
    return root


@pytest.fixture
def knowledge_store(ade_root: Path) -> KnowledgeStore:
    return KnowledgeStore(ingest(ade_root))


@pytest.fixture
def test_client(monkeypatch: pytest.MonkeyPatch, ade_root: Path, tmp_path: Path) -> TestClient:
    get_settings.cache_clear()
    monkeypatch.setenv("ADE_ROOT", str(ade_root))
    monkeypatch.setenv("INDEX_PATH", str(tmp_path / "missing.json"))
    from application import get_application

    return TestClient(get_application())

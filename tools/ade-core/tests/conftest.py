import os
import shutil
from pathlib import Path

import pytest

FIXTURES = Path(__file__).parent / "fixtures"


def _find_ade_root() -> Path | None:
    env = os.environ.get("ADE_ROOT")
    if env and Path(env, "CLAUDE.md").exists():
        return Path(env)
    for parent in Path(__file__).resolve().parents:
        if (parent / "CLAUDE.md").exists() and (parent / "backend").is_dir():
            return parent
    return None


@pytest.fixture
def ade_root() -> Path:
    root = _find_ade_root()
    if root is None:
        pytest.skip("ADE_ROOT not available")
    return root


@pytest.fixture
def sample_template(tmp_path: Path) -> Path:
    """A writable copy of tests/fixtures/sample-tpl plus generated folders that must be excluded."""
    template = tmp_path / "sample-tpl"
    shutil.copytree(FIXTURES / "sample-tpl", template)
    (template / "node_modules" / "left-pad").mkdir(parents=True)
    (template / "node_modules" / "left-pad" / "index.js").write_text("module.exports = 1;\n")
    (template / ".env").write_text("SECRET=local-only\n")
    return template

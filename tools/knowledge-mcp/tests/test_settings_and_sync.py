from pathlib import Path

import pytest

from infrastructure.settings import Settings, get_settings
from knowledge.bootstrap import load_store
from knowledge.sync import sync_index


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

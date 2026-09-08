from pathlib import Path

from infrastructure.settings import get_settings
from knowledge.ingest import ingest
from knowledge.store import KnowledgeStore


def load_store() -> KnowledgeStore:
    settings = get_settings()
    index_path = Path(settings.index_path)
    if index_path.is_file():
        return KnowledgeStore.load(index_path)
    return KnowledgeStore(ingest(settings.resolve_ade_root()))

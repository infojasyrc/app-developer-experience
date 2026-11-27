from pathlib import Path

from ade_core.knowledge.ingest import ingest
from ade_core.knowledge.store import KnowledgeStore

from infrastructure.settings import get_settings


def load_store() -> KnowledgeStore:
    settings = get_settings()
    index_path = Path(settings.index_path)
    if index_path.is_file():
        return KnowledgeStore.load(index_path)
    return KnowledgeStore(ingest(settings.resolve_ade_root()))

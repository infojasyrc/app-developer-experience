from pathlib import Path

from infrastructure.settings import get_settings
from knowledge.ingest import ingest
from knowledge.store import KnowledgeStore


def sync_index() -> Path:
    settings = get_settings()
    records = ingest(settings.resolve_ade_root())
    out = Path(settings.index_path)
    KnowledgeStore(records).save(out)
    return out


def main() -> None:
    path = sync_index()
    print(f"Wrote knowledge index to {path}")


if __name__ == "__main__":
    main()

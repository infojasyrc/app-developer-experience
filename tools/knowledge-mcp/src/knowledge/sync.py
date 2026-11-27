from pathlib import Path

from ade_core.knowledge.build import build_index

from infrastructure.settings import get_settings


def sync_index() -> Path:
    settings = get_settings()
    return build_index(settings.resolve_ade_root(), Path(settings.index_path))


def main() -> None:
    path = sync_index()
    print(f"Wrote knowledge index to {path}")


if __name__ == "__main__":
    main()

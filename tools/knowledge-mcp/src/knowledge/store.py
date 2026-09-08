from __future__ import annotations

import json
from pathlib import Path

from knowledge.models import ConventionRecord


class KnowledgeStore:
    def __init__(self, records: list[ConventionRecord] | None = None) -> None:
        self._records = list(records or [])

    @property
    def records(self) -> list[ConventionRecord]:
        return list(self._records)

    def find(self, topic: str) -> list[ConventionRecord]:
        query = topic.strip().lower()
        matches = [
            record
            for record in self._records
            if query == record.topic.lower()
            or query in {tag.lower() for tag in record.tags}
            or query in record.topic.lower()
        ]
        return matches

    def by_source(self, suffix: str) -> list[ConventionRecord]:
        return [record for record in self._records if record.source_path.endswith(suffix)]

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = [record.to_dict() for record in self._records]
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    @classmethod
    def load(cls, path: Path) -> "KnowledgeStore":
        payload = json.loads(path.read_text(encoding="utf-8"))
        return cls([ConventionRecord.from_dict(item) for item in payload])

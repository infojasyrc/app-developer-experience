"""artifacts-index.json (index_schema 1): every released artifact and its versions.

Published by .github/workflows/release.yml on the rolling `index` release so
clients resolve versions without the (rate-limited) GitHub REST API.
"""

from __future__ import annotations

import json
from typing import Literal

from pydantic import BaseModel, ConfigDict, ValidationError

from ade_core.domain.errors import AdeCoreError
from ade_core.domain.versions import select

INDEX_FILE = "artifacts-index.json"


class _Model(BaseModel):
    model_config = ConfigDict(extra="ignore")


class IndexVersion(_Model):
    url: str
    sha256: str
    manifest_schema: int = 1
    min_engine_version: str = "0.1.0"


class IndexArtifact(_Model):
    kind: Literal["project-template", "asset-template", "knowledge", "cli"]
    tag_prefix: str
    description: str = ""
    latest: str
    versions: dict[str, IndexVersion] = {}

    def resolve(self, spec: str) -> str | None:
        return select(list(self.versions), spec)


class ArtifactsIndex(_Model):
    index_schema: Literal[1]
    generated_at: str
    registry: str = ""
    artifacts: dict[str, IndexArtifact] = {}

    @classmethod
    def parse(cls, text: str) -> "ArtifactsIndex":
        try:
            return cls.model_validate(json.loads(text))
        except (json.JSONDecodeError, ValidationError) as exc:
            raise AdeCoreError(f"invalid {INDEX_FILE}: {exc}") from exc

    def dumps(self) -> str:
        return json.dumps(self.model_dump(mode="json"), indent=2, sort_keys=False) + "\n"

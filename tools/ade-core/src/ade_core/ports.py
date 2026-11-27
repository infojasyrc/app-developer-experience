"""Ports: what the use cases need from the outside world (analysis §2.2)."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Protocol

from ade_core.domain.index import ArtifactsIndex


@dataclass(frozen=True)
class ResolvedTemplate:
    artifact: str
    version: str
    template_dir: Path
    origin: str  # e.g. "github:owner/repo@nestjs-rest-tpl-v0.3.0" or "path:/repo/backend/nestjs-rest-tpl"
    warnings: tuple[str, ...] = field(default_factory=tuple)


class ArtifactSource(Protocol):
    def index(self) -> ArtifactsIndex:
        """Every artifact this source can resolve."""
        ...

    def resolve(self, artifact: str, spec: str) -> ResolvedTemplate:
        """Return a local, verified template directory for `artifact@spec`."""
        ...

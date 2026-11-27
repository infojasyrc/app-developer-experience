"""`--source path:<dir>`: an unreleased template working copy (ADE maintainers)."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from ade_core.domain.errors import ParameterError
from ade_core.domain.index import ArtifactsIndex, IndexArtifact
from ade_core.domain.manifest import load_manifest
from ade_core.ports import ResolvedTemplate

LOCAL_VERSION = "0.0.0-local"


class LocalSource:
    def __init__(self, template_dir: Path) -> None:
        self.template_dir = Path(template_dir).resolve()
        self.manifest = load_manifest(self.template_dir)

    def index(self) -> ArtifactsIndex:
        artifact = IndexArtifact(
            kind=self.manifest.kind,
            tag_prefix="",
            description=self.manifest.description,
            latest=LOCAL_VERSION,
        )
        return ArtifactsIndex(
            index_schema=1,
            generated_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
            registry=f"path:{self.template_dir}",
            artifacts={self.manifest.artifact: artifact},
        )

    def resolve(self, artifact: str, spec: str) -> ResolvedTemplate:
        if artifact != self.manifest.artifact:
            raise ParameterError(
                f"--source path:{self.template_dir} provides '{self.manifest.artifact}', not '{artifact}'"
            )
        warnings = ()
        if spec not in ("", "latest"):
            warnings = (f"version '{spec}' ignored: a path source always uses the working copy",)
        return ResolvedTemplate(
            artifact=artifact,
            version=LOCAL_VERSION,
            template_dir=self.template_dir,
            origin=f"path:{self.template_dir}",
            warnings=warnings,
        )

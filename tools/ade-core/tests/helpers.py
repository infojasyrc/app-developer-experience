"""Helpers to fake GitHub releases of the sample template (no network)."""

from __future__ import annotations

import hashlib
import io
import tarfile
from pathlib import Path

from ade_core.domain.index import ArtifactsIndex, IndexArtifact, IndexVersion

REGISTRY = "acme/ade"


def make_bundle(template_dir: Path, skip_manifest: bool = False) -> bytes:
    """A .tar.gz with the template contents at the archive root, like generate-release-changelog."""
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w:gz") as archive:
        for path in sorted(Path(template_dir).rglob("*")):
            rel = path.relative_to(template_dir).as_posix()
            if skip_manifest and rel == "template.yaml":
                continue
            if path.is_file() and "node_modules" not in rel:
                archive.add(path, arcname=rel)
    return buffer.getvalue()


def make_index(bundles: dict[str, bytes], min_engine: str = "0.1.0") -> ArtifactsIndex:
    """bundles: version -> bytes. URLs are https://example.test/<version>.tar.gz."""
    versions = {
        version: IndexVersion(
            url=f"https://example.test/{version}.tar.gz",
            sha256=hashlib.sha256(payload).hexdigest(),
            min_engine_version=min_engine,
        )
        for version, payload in bundles.items()
    }
    latest = max(versions, key=lambda v: tuple(int(p) for p in v.split(".")))
    return ArtifactsIndex(
        index_schema=1,
        generated_at="2026-11-27T00:00:00+00:00",
        registry=REGISTRY,
        artifacts={
            "sample": IndexArtifact(
                kind="project-template", tag_prefix="sample-tpl-v", latest=latest, versions=versions
            )
        },
    )


class FakeOpener:
    def __init__(self, responses: dict[str, bytes]) -> None:
        self.responses = responses
        self.calls: list[str] = []

    def __call__(self, url: str) -> bytes:
        from ade_core.domain.errors import AdeCoreError

        self.calls.append(url)
        if url not in self.responses:
            raise AdeCoreError(f"cannot download {url}: 404")
        return self.responses[url]

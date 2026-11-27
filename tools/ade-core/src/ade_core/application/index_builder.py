"""Build artifacts-index.json from gathered release data (used by .github/workflows/release.yml).

Input layout (one folder per release tag, gathered by the workflow with git + gh):

    <releases-dir>/<tpl>-vX.Y.Z/template.yaml              # git show <tag>:backend/<tpl>/template.yaml
    <releases-dir>/<tpl>-vX.Y.Z/<tpl>-vX.Y.Z.tar.gz.sha256 # gh release download <tag> -p '*.tar.gz.sha256'

Tags without a template.yaml (released before Phase 1) are not scaffoldable and are skipped.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from pathlib import Path

from ade_core.domain.errors import AdeCoreError
from ade_core.domain.index import ArtifactsIndex, IndexArtifact, IndexVersion
from ade_core.domain.manifest import MANIFEST_FILE, load_manifest
from ade_core.domain.versions import Version

_TAG = re.compile(r"^(?P<prefix>.+-v)(?P<version>\d+\.\d+\.\d+)$")
_SHA = re.compile(r"^([0-9a-fA-F]{64})\b")


def asset_url(registry: str, tag: str, filename: str) -> str:
    return f"https://github.com/{registry}/releases/download/{tag}/{filename}"


def _read_sha(path: Path) -> str:
    match = _SHA.match(path.read_text(encoding="utf-8").strip())
    if not match:
        raise AdeCoreError(f"{path}: not a sha256sum line")
    return match.group(1).lower()


def build_index(releases_dir: Path, registry: str, generated_at: str | None = None) -> ArtifactsIndex:
    artifacts: dict[str, IndexArtifact] = {}
    skipped: list[str] = []
    for folder in sorted(p for p in Path(releases_dir).iterdir() if p.is_dir()):
        tag = folder.name
        match = _TAG.match(tag)
        sha_file = folder / f"{tag}.tar.gz.sha256"
        if not match or not (folder / MANIFEST_FILE).is_file() or not sha_file.is_file():
            skipped.append(tag)
            continue
        manifest = load_manifest(folder)
        version = match.group("version")
        artifact = artifacts.setdefault(
            manifest.artifact,
            IndexArtifact(
                kind=manifest.kind,
                tag_prefix=match.group("prefix"),
                description=manifest.description,
                latest=version,
            ),
        )
        if artifact.tag_prefix != match.group("prefix"):
            raise AdeCoreError(
                f"artifact {manifest.artifact} is released under two tag prefixes: "
                f"{artifact.tag_prefix} and {match.group('prefix')}"
            )
        artifact.versions[version] = IndexVersion(
            url=asset_url(registry, tag, f"{tag}.tar.gz"),
            sha256=_read_sha(sha_file),
            manifest_schema=manifest.manifest_schema,
            min_engine_version=manifest.min_engine_version,
        )
        if Version.parse(version) > Version.parse(artifact.latest):
            artifact.latest = version
            artifact.description = manifest.description

    for artifact in artifacts.values():
        ordered = sorted(artifact.versions, key=Version.parse, reverse=True)
        artifact.versions = {v: artifact.versions[v] for v in ordered}
    return ArtifactsIndex(
        index_schema=1,
        generated_at=generated_at or datetime.now(timezone.utc).isoformat(timespec="seconds"),
        registry=registry,
        artifacts=dict(sorted(artifacts.items())),
    )

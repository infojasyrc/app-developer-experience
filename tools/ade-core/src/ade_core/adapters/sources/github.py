"""GitHub Releases source: artifacts-index.json + checksummed template bundles (analysis §3.3).

- The index is read from the rolling `index` release (a plain asset download,
  not the rate-limited REST API) and cached for 24h. When the network fails, a
  stale cached index is used with a warning.
- Bundles are downloaded once per version, verified against the sha256 in the
  index and extracted with tarfile's `data` filter (no absolute paths, links
  outside the tree, or device files).
"""

from __future__ import annotations

import hashlib
import io
import os
import shutil
import tarfile
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Callable

from ade_core import __version__
from ade_core.domain.errors import AdeCoreError, ParameterError
from ade_core.domain.index import INDEX_FILE, ArtifactsIndex
from ade_core.domain.manifest import MANIFEST_FILE, load_manifest
from ade_core.domain.versions import is_at_least
from ade_core.ports import ResolvedTemplate

DEFAULT_REGISTRY = "infojasyrc/app-developer-experience"
INDEX_TAG = "index"
INDEX_TTL_SECONDS = 24 * 60 * 60

Opener = Callable[[str], bytes]


def index_url_for(registry: str) -> str:
    return f"https://github.com/{registry}/releases/download/{INDEX_TAG}/{INDEX_FILE}"


def default_cache_dir() -> Path:
    base = os.environ.get("XDG_CACHE_HOME") or os.path.join(os.path.expanduser("~"), ".cache")
    return Path(base) / "appdevexp"


def http_open(url: str, timeout: float = 30.0) -> bytes:
    """GET a URL (http(s) or file://). Sends GITHUB_TOKEN when set (forks / private mirrors)."""
    request = urllib.request.Request(url, headers={"User-Agent": f"appdevexp/ade-core-{__version__}"})
    token = os.environ.get("GITHUB_TOKEN")
    if token and url.startswith("https://"):
        request.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:  # noqa: S310 (scheme is ours)
            return response.read()
    except (urllib.error.URLError, OSError) as exc:
        raise AdeCoreError(f"cannot download {url}: {exc}") from exc


class GitHubReleaseSource:
    def __init__(
        self,
        registry: str = DEFAULT_REGISTRY,
        index_url: str | None = None,
        cache_dir: Path | None = None,
        opener: Opener = http_open,
        ttl_seconds: int = INDEX_TTL_SECONDS,
        now: Callable[[], float] = time.time,
    ) -> None:
        self.registry = registry
        self.index_url = index_url or index_url_for(registry)
        self.cache_dir = Path(cache_dir or default_cache_dir())
        self.opener = opener
        self.ttl_seconds = ttl_seconds
        self.now = now
        self.warnings: list[str] = []
        self._index: ArtifactsIndex | None = None

    # -- index -------------------------------------------------------------
    @property
    def _index_cache(self) -> Path:
        key = hashlib.sha256(self.index_url.encode()).hexdigest()[:16]
        return self.cache_dir / "index" / f"{key}.json"

    def index(self) -> ArtifactsIndex:
        if self._index is not None:
            return self._index
        cached = self._index_cache
        fresh = cached.is_file() and self.now() - cached.stat().st_mtime < self.ttl_seconds
        if fresh:
            self._index = ArtifactsIndex.parse(cached.read_text(encoding="utf-8"))
            return self._index
        try:
            payload = self.opener(self.index_url)
        except AdeCoreError as exc:
            if not cached.is_file():
                raise AdeCoreError(
                    f"{exc}. The artifacts index is not available; check the network, pass --index-url, "
                    "or use --source path:<template dir>"
                ) from exc
            self.warnings.append(f"offline: using the cached artifacts index from {cached} ({exc})")
            self._index = ArtifactsIndex.parse(cached.read_text(encoding="utf-8"))
            return self._index
        self._index = ArtifactsIndex.parse(payload.decode("utf-8"))
        cached.parent.mkdir(parents=True, exist_ok=True)
        cached.write_bytes(payload)
        return self._index

    # -- bundles -----------------------------------------------------------
    def resolve(self, artifact: str, spec: str) -> ResolvedTemplate:
        index = self.index()
        entry = index.artifacts.get(artifact)
        if entry is None or entry.kind != "project-template":
            known = sorted(name for name, item in index.artifacts.items() if item.kind == "project-template")
            raise ParameterError(f"unknown template '{artifact}' (available: {', '.join(known) or 'none'})")
        version = entry.resolve(spec)
        if version is None:
            raise ParameterError(
                f"no released version of {artifact} satisfies '{spec}' (released: {', '.join(entry.versions)})"
            )
        release = entry.versions[version]
        if not is_at_least(__version__, release.min_engine_version):
            raise AdeCoreError(
                f"{artifact}@{version} requires ade-core >= {release.min_engine_version}; this is {__version__}. "
                "Update appdevexp (rebuild the CLI from a newer ADE checkout)."
            )
        target = self.cache_dir / "bundles" / artifact / version
        if not (target / MANIFEST_FILE).is_file():
            self._download(release.url, release.sha256, target)
        load_manifest(target)  # validates the manifest that travels in the bundle
        return ResolvedTemplate(
            artifact=artifact,
            version=version,
            template_dir=target,
            origin=f"github:{self.registry}@{entry.tag_prefix}{version}",
            warnings=tuple(self.warnings),
        )

    def _download(self, url: str, sha256: str, target: Path) -> None:
        payload = self.opener(url)
        digest = hashlib.sha256(payload).hexdigest()
        if digest != sha256.lower():
            raise AdeCoreError(f"checksum mismatch for {url}: expected {sha256}, got {digest}")
        target.parent.mkdir(parents=True, exist_ok=True)
        staging = Path(tempfile.mkdtemp(prefix=".bundle-", dir=target.parent))
        try:
            with tarfile.open(fileobj=io.BytesIO(payload), mode="r:gz") as archive:
                archive.extractall(staging, filter="data")
            if not (staging / MANIFEST_FILE).is_file():
                raise AdeCoreError(f"{url} has no {MANIFEST_FILE} at its root (released before Phase 1?)")
            if target.exists():
                shutil.rmtree(target)
            staging.rename(target)
        finally:
            if staging.exists():
                shutil.rmtree(staging, ignore_errors=True)

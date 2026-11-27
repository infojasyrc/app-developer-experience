import os

import pytest
from helpers import FakeOpener, make_bundle, make_index

from ade_core.adapters.sources import github
from ade_core.adapters.sources.github import GitHubReleaseSource, default_cache_dir, http_open, index_url_for
from ade_core.adapters.sources.local import LOCAL_VERSION, LocalSource
from ade_core.domain.errors import AdeCoreError, ManifestError, ParameterError

INDEX_URL = "https://example.test/artifacts-index.json"


def _source(tmp_path, responses, **kwargs) -> tuple[GitHubReleaseSource, FakeOpener]:
    opener = FakeOpener(responses)
    return GitHubReleaseSource(index_url=INDEX_URL, cache_dir=tmp_path / "cache", opener=opener, **kwargs), opener


def test_resolve_downloads_verifies_and_caches(sample_template, tmp_path):
    bundle = make_bundle(sample_template)
    index = make_index({"0.1.0": bundle, "0.2.0": bundle})
    source, opener = _source(
        tmp_path,
        {
            INDEX_URL: index.dumps().encode(),
            "https://example.test/0.1.0.tar.gz": bundle,
            "https://example.test/0.2.0.tar.gz": bundle,
        },
    )
    resolved = source.resolve("sample", "^0.1")
    assert resolved.version == "0.1.0"
    assert resolved.origin == "github:infojasyrc/app-developer-experience@sample-tpl-v0.1.0"
    assert (resolved.template_dir / "template.yaml").is_file()
    assert not (resolved.template_dir / "node_modules").exists()

    assert source.resolve("sample", "latest").version == "0.2.0"
    source.resolve("sample", "0.1.0")
    assert opener.calls.count("https://example.test/0.1.0.tar.gz") == 1  # bundle cache hit
    assert opener.calls.count(INDEX_URL) == 1  # index memoized

    # A new source instance reads the fresh cached index without the network.
    second, second_opener = _source(tmp_path, {})
    assert second.resolve("sample", "0.2.0").version == "0.2.0"
    assert second_opener.calls == []


def test_checksum_mismatch(sample_template, tmp_path):
    bundle = make_bundle(sample_template)
    index = make_index({"0.1.0": bundle})
    source, _ = _source(
        tmp_path, {INDEX_URL: index.dumps().encode(), "https://example.test/0.1.0.tar.gz": bundle + b"tampered"}
    )
    with pytest.raises(AdeCoreError, match="checksum mismatch"):
        source.resolve("sample", "latest")


def test_bundle_without_manifest(sample_template, tmp_path):
    bundle = make_bundle(sample_template, skip_manifest=True)
    index = make_index({"0.1.0": bundle})
    source, _ = _source(tmp_path, {INDEX_URL: index.dumps().encode(), "https://example.test/0.1.0.tar.gz": bundle})
    with pytest.raises(AdeCoreError, match="no template.yaml"):
        source.resolve("sample", "latest")
    assert not (tmp_path / "cache" / "bundles" / "sample" / "0.1.0").exists()


def test_min_engine_version_and_unknown(sample_template, tmp_path):
    bundle = make_bundle(sample_template)
    index = make_index({"0.1.0": bundle}, min_engine="99.0.0")
    source, _ = _source(tmp_path, {INDEX_URL: index.dumps().encode()})
    with pytest.raises(AdeCoreError, match="requires ade-core >= 99.0.0"):
        source.resolve("sample", "latest")
    with pytest.raises(ParameterError, match="unknown template 'nope'"):
        source.resolve("nope", "latest")
    with pytest.raises(ParameterError, match="no released version"):
        source.resolve("sample", "^5")


def test_offline_uses_stale_cache(sample_template, tmp_path):
    index = make_index({"0.1.0": make_bundle(sample_template)})
    clock = [1_000_000.0]
    online, _ = _source(tmp_path, {INDEX_URL: index.dumps().encode()}, now=lambda: clock[0])
    online.index()
    clock[0] += 2 * 24 * 3600
    cache = next((tmp_path / "cache" / "index").iterdir())
    os.utime(cache, (1_000_000.0, 1_000_000.0))
    offline, _ = _source(tmp_path, {}, now=lambda: clock[0])
    assert "sample" in offline.index().artifacts
    assert offline.warnings and "offline" in offline.warnings[0]


def test_no_index_and_no_cache(tmp_path):
    source, _ = _source(tmp_path, {})
    with pytest.raises(AdeCoreError, match="--source path"):
        source.index()


def test_defaults(monkeypatch, tmp_path):
    assert index_url_for("o/r") == "https://github.com/o/r/releases/download/index/artifacts-index.json"
    monkeypatch.setenv("XDG_CACHE_HOME", str(tmp_path))
    assert default_cache_dir() == tmp_path / "appdevexp"
    assert GitHubReleaseSource(registry="o/r").index_url.startswith("https://github.com/o/r/")


def test_http_open_file_url_and_errors(tmp_path, monkeypatch):
    target = tmp_path / "index.json"
    target.write_text("{}")
    monkeypatch.setenv("GITHUB_TOKEN", "t0ken")
    assert http_open(target.as_uri()) == b"{}"
    with pytest.raises(AdeCoreError, match="cannot download"):
        http_open((tmp_path / "missing.json").as_uri())


def test_http_open_sends_token(monkeypatch):
    seen = {}

    class _Response:
        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

        def read(self):
            return b"ok"

    def fake_urlopen(request, timeout):
        seen["auth"] = request.get_header("Authorization")
        return _Response()

    monkeypatch.setenv("GITHUB_TOKEN", "t0ken")
    monkeypatch.setattr(github.urllib.request, "urlopen", fake_urlopen)
    assert http_open("https://example.test/x") == b"ok"
    assert seen["auth"] == "Bearer t0ken"


def test_local_source(sample_template):
    source = LocalSource(sample_template)
    assert source.index().artifacts["sample"].latest == LOCAL_VERSION
    resolved = source.resolve("sample", "^1")
    assert resolved.version == LOCAL_VERSION and resolved.warnings
    assert source.resolve("sample", "latest").warnings == ()
    with pytest.raises(ParameterError):
        source.resolve("other", "latest")
    with pytest.raises(ManifestError):
        LocalSource(sample_template / "src")

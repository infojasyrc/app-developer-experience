import json
import shutil

import pytest

from ade_core.application.index_builder import build_index
from ade_core.cli import main
from ade_core.domain.errors import AdeCoreError

SHA_A = "a" * 64
SHA_B = "b" * 64


def _release(root, tag, template_dir, sha, manifest=True):
    folder = root / tag
    folder.mkdir(parents=True)
    if manifest:
        shutil.copy(template_dir / "template.yaml", folder / "template.yaml")
    (folder / f"{tag}.tar.gz.sha256").write_text(f"{sha}  {tag}.tar.gz\n")


def test_build_index(sample_template, tmp_path):
    releases = tmp_path / "releases"
    _release(releases, "sample-tpl-v0.1.0", sample_template, SHA_A, manifest=False)  # pre-Phase-1: skipped
    _release(releases, "sample-tpl-v0.10.0", sample_template, SHA_B)
    _release(releases, "sample-tpl-v0.9.1", sample_template, SHA_A)
    (releases / "not-a-tag").mkdir()

    index = build_index(releases, "o/r", generated_at="now")
    artifact = index.artifacts["sample"]
    assert artifact.latest == "0.10.0"
    assert list(artifact.versions) == ["0.10.0", "0.9.1"]
    assert artifact.tag_prefix == "sample-tpl-v"
    assert artifact.versions["0.10.0"].sha256 == SHA_B
    assert artifact.versions["0.10.0"].url == (
        "https://github.com/o/r/releases/download/sample-tpl-v0.10.0/sample-tpl-v0.10.0.tar.gz"
    )
    assert artifact.versions["0.9.1"].min_engine_version == "0.1.0"


def test_build_index_rejects_bad_sha_and_two_prefixes(sample_template, tmp_path):
    bad = tmp_path / "bad"
    _release(bad, "sample-tpl-v0.1.0", sample_template, "nope")
    with pytest.raises(AdeCoreError, match="sha256sum"):
        build_index(bad, "o/r")

    two = tmp_path / "two"
    _release(two, "sample-tpl-v0.1.0", sample_template, SHA_A)
    _release(two, "other-v0.2.0", sample_template, SHA_A)
    with pytest.raises(AdeCoreError, match="two tag prefixes"):
        build_index(two, "o/r")


def test_cli_index(sample_template, tmp_path, capsys):
    releases = tmp_path / "releases"
    _release(releases, "sample-tpl-v0.1.0", sample_template, SHA_A)
    out = tmp_path / "out" / "artifacts-index.json"
    assert main(["index", "--releases-dir", str(releases), "--registry", "o/r", "--out", str(out)]) == 0
    assert json.loads(out.read_text())["artifacts"]["sample"]["latest"] == "0.1.0"
    assert "sample@0.1.0 (1)" in capsys.readouterr().out

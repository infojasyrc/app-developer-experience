import json
import shutil
from pathlib import Path

import pytest

from ade_core.application.combinations import combinations_for, github_matrix, select_templates, validate
from ade_core.cli import main
from ade_core.domain.manifest import load_manifest


@pytest.fixture
def fake_repo(sample_template, tmp_path) -> Path:
    repo = tmp_path / "repo"
    (repo / "backend").mkdir(parents=True)
    shutil.copytree(sample_template, repo / "backend" / "sample-tpl")
    return repo


def test_combinations_cover_every_value(sample_template):
    combos = combinations_for(sample_template, load_manifest(sample_template))
    assert [c.name for c in combos] == [
        "sample-enabled-postgres",
        "sample-enabled-none",
        "sample-none-postgres",
        "sample-none-none",
    ]
    assert combos[-1].features_arg == "flags=none database=none"


def test_github_matrix_filters_by_changed_packages(fake_repo):
    assert len(github_matrix(fake_repo, "")["include"]) == 4
    assert len(github_matrix(fake_repo, "ade-core")["include"]) == 4
    assert len(github_matrix(fake_repo, "tpl-sample cm-api")["include"]) == 4
    assert github_matrix(fake_repo, "cm-api") == {"include": []}
    first = github_matrix(fake_repo)["include"][0]
    assert first == {
        "template": "sample-tpl",
        "name": "sample-enabled-postgres",
        "features": "flags=enabled database=postgres",
    }


def test_select_templates_empty_mapping():
    assert select_templates({}, "tpl-x") == {}


def test_validate_reports_failures(sample_template, tmp_path):
    assert validate([sample_template]) == []
    (sample_template / "src/core/env.ts").write_text("export interface Env {}\n")
    failures = validate([sample_template])
    assert len(failures) == 2  # the two combinations with flags=none
    assert all("remove_lines[1]" in failure for failure in failures)
    assert validate([tmp_path / "missing"])[0].endswith("not found")


def test_cli_render(sample_template, tmp_path, capsys):
    out = tmp_path / "out"
    code = main(["render", str(sample_template), "--out", str(out), "--name", "orders", "--feature", "flags=none"])
    assert code == 0
    printed = capsys.readouterr().out
    assert "Rendered sample as 'orders'" in printed
    assert "Features: flags=none database=postgres" in printed
    assert "make build" in printed


def test_cli_errors_exit_2(sample_template, tmp_path, capsys):
    out = str(tmp_path / "out")
    assert main(["render", str(sample_template), "--out", out, "--name", "orders", "--feature", "flags"]) == 2
    assert "expects key=value" in capsys.readouterr().err
    assert main(["render", str(sample_template), "--out", out, "--name", "Bad Name"]) == 2


def test_cli_validate_and_combinations(fake_repo, capsys):
    assert main(["validate", "--repo", str(fake_repo)]) == 0
    assert "Validated 1 manifest(s): OK" in capsys.readouterr().out
    assert main(["combinations", "--repo", str(fake_repo), "--packages", "tpl-sample"]) == 0
    assert len(json.loads(capsys.readouterr().out)["include"]) == 4


def test_cli_validate_failures(fake_repo, tmp_path, capsys):
    (fake_repo / "backend/sample-tpl/Makefile").write_text("build:\n\techo\n")
    assert main(["validate", "--repo", str(fake_repo)]) == 1
    assert "FAIL" in capsys.readouterr().err
    assert main(["validate", "--repo", str(tmp_path / "empty")]) == 1

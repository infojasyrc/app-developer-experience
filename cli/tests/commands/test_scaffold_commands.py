import hashlib
import io
import json
import tarfile
from pathlib import Path

import pytest
import yaml
from click.testing import CliRunner

from src.main import cli

FIXTURE = Path(__file__).parent / "fixtures" / "mini-tpl"


@pytest.fixture
def runner() -> CliRunner:
    return CliRunner()


@pytest.fixture
def released(tmp_path, monkeypatch) -> str:
    """A file:// artifacts index whose bundle is the fixture template; returns the index URL."""
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w:gz") as archive:
        for path in sorted(FIXTURE.rglob("*")):
            if path.is_file():
                archive.add(path, arcname=path.relative_to(FIXTURE).as_posix())
    bundle = tmp_path / "releases" / "mini-tpl-v0.2.0.tar.gz"
    bundle.parent.mkdir()
    bundle.write_bytes(buffer.getvalue())
    index = {
        "index_schema": 1,
        "generated_at": "2026-11-27T00:00:00+00:00",
        "registry": "acme/ade",
        "artifacts": {
            "mini": {
                "kind": "project-template",
                "tag_prefix": "mini-tpl-v",
                "description": "Minimal",
                "latest": "0.2.0",
                "versions": {
                    "0.2.0": {"url": bundle.as_uri(), "sha256": hashlib.sha256(bundle.read_bytes()).hexdigest()}
                },
            }
        },
    }
    index_file = tmp_path / "releases" / "artifacts-index.json"
    index_file.write_text(json.dumps(index))
    monkeypatch.setenv("XDG_CACHE_HOME", str(tmp_path / "cache"))
    return index_file.as_uri()


def test_version(runner):
    result = runner.invoke(cli, ["--version"])
    assert result.exit_code == 0
    assert "appdevexp 0.3.0 (ade-core" in result.output


def test_list_text_and_json(runner, released):
    result = runner.invoke(cli, ["list", "--index-url", released, "--refresh"])
    assert result.exit_code == 0, result.output
    assert "mini" in result.output and "0.2.0" in result.output
    as_json = runner.invoke(cli, ["list", "--index-url", released, "--format", "json", "--kind", "cli"])
    assert json.loads(as_json.output) == {}


def test_list_empty_and_errors(runner, released, tmp_path):
    assert "No artifacts found" in runner.invoke(cli, ["list", "--index-url", released, "--kind", "cli"]).output
    missing = runner.invoke(cli, ["list", "--index-url", (tmp_path / "nope.json").as_uri()])
    assert missing.exit_code == 1 and "artifacts index is not available" in missing.output
    bad = runner.invoke(cli, ["list", "--source", "ftp"])
    assert bad.exit_code == 2


def test_new_dry_run_writes_nothing(runner, released, tmp_path):
    target = tmp_path / "repo"
    target.mkdir()
    args = ["new", "service", "-t", "mini@^0.2", "-n", "orders-api", "--target", str(target), "--index-url", released]
    result = runner.invoke(cli, [*args, "--dry-run"])
    assert result.exit_code == 0, result.output
    assert "Plan (mini@0.2.0 → orders-api)" in result.output
    assert "Nothing written." in result.output
    assert list(target.iterdir()) == []


def test_new_apply_from_release(runner, released, tmp_path):
    target = tmp_path / "repo"
    (target / "backend" / "billing").mkdir(parents=True)
    (target / "nx.json").write_text("{}")
    (target / "backend" / "billing" / ".env.public").write_text("HTTP_PORT=4000\n")
    result = runner.invoke(
        cli,
        [
            "new",
            "service",
            "--template",
            "mini",
            "--name",
            "orders-api",
            "--feature",
            "database=none",
            "--target",
            str(target),
            "--index-url",
            released,
            "--yes",
        ],
    )
    assert result.exit_code == 0, result.output
    service = target / "backend" / "orders-api"
    assert "HTTP_PORT=4001" in (service / ".env.public").read_text()
    assert "DB_USER" not in (service / ".env.public").read_text()
    assert not (service / "src" / "db.ts").exists()
    assert "make unit-tests" in result.output and "4000 is used by backend/billing" in result.output
    receipt = yaml.safe_load((target / ".ade" / "answers.yaml").read_text())
    assert receipt["cli_version"] == "0.3.0"
    assert receipt["artifacts"][0]["source"] == "github:infojasyrc/app-developer-experience@mini-tpl-v0.2.0"


def test_new_with_path_source_answers_and_json(runner, tmp_path):
    answers = tmp_path / "answers.yaml"
    answers.write_text(
        yaml.safe_dump({"template": "mini", "parameters": {"name": "billing"}, "features": {"database": "none"}})
    )
    target = tmp_path / "repo"
    target.mkdir()
    result = runner.invoke(
        cli,
        [
            "new",
            "service",
            "--answers",
            str(answers),
            "--source",
            f"path:{FIXTURE}",
            "--target",
            str(target),
            "--format",
            "json",
            "--yes",
        ],
    )
    assert result.exit_code == 0, result.output
    payload = json.loads(result.output)
    assert payload["applied"] is True and payload["features"] == {"database": "none"}
    assert (target / "billing" / "README.md").read_text() == "# billing\n"


def test_new_requires_inputs_without_terminal(runner, released, tmp_path):
    base = ["new", "service", "--target", str(tmp_path), "--index-url", released]
    assert "--template is required" in runner.invoke(cli, base).output
    assert "--name is required" in runner.invoke(cli, [*base, "-t", "mini"]).output
    no_yes = runner.invoke(cli, [*base, "-t", "mini", "-n", "orders-api"])
    assert no_yes.exit_code == 2 and "pass --yes" in no_yes.output
    assert not (tmp_path / "orders-api").exists()


def test_new_reports_core_errors(runner, released, tmp_path):
    base = ["new", "service", "--target", str(tmp_path), "--index-url", released, "-n", "orders-api", "--yes"]
    unknown = runner.invoke(cli, [*base, "-t", "nope"])
    assert unknown.exit_code == 1 and "unknown template 'nope'" in unknown.output
    bad_feature = runner.invoke(cli, [*base, "-t", "mini", "-f", "database"])
    assert bad_feature.exit_code == 2 and "expected key=value" in bad_feature.output
    bad_answers = tmp_path / "list.yaml"
    bad_answers.write_text("- a\n")
    assert runner.invoke(cli, [*base, "-t", "mini", "--answers", str(bad_answers)]).exit_code == 2


def test_new_interactive(monkeypatch, runner, released, tmp_path):
    import commands.new as new_module

    monkeypatch.setattr(new_module, "is_interactive", lambda: True)
    answers = iter([{"template": "mini"}, {"name": "orders-api"}, {"database": "none"}])
    monkeypatch.setattr(new_module.inquirer, "prompt", lambda questions: next(answers))
    result = runner.invoke(
        cli, ["new", "service", "--target", str(tmp_path), "--index-url", released], input="y\n"
    )
    assert result.exit_code == 0, result.output
    assert (tmp_path / "orders-api" / "src" / "app.ts").exists()
    assert not (tmp_path / "orders-api" / "src" / "db.ts").exists()

    declined = runner.invoke(
        cli,
        ["new", "service", "-t", "mini", "-n", "other", "-f", "database=postgres", "--target", str(tmp_path),
         "--index-url", released],
        input="n\n",
    )
    assert declined.exit_code == 0 and "Nothing written." in declined.output
    assert not (tmp_path / "other").exists()

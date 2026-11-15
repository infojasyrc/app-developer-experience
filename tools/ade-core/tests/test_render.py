import json
from pathlib import Path

import pytest
import yaml

from ade_core.application.render import is_excluded, render_template
from ade_core.domain.errors import ParameterError, StaleManifestError


def _files(root: Path) -> set[str]:
    return {p.relative_to(root).as_posix() for p in root.rglob("*") if p.is_file()}


def test_render_defaults_renames_and_edits(sample_template, tmp_path):
    out = tmp_path / "out"
    result = render_template(sample_template, out, {"name": "orders-api", "platform": "linux/arm64"})

    assert result.features == {"flags": "enabled", "database": "postgres"}
    assert result.next_steps == ["make build"]
    files = _files(out)
    assert "template.yaml" not in files
    assert "CHANGELOG.md" not in files
    assert ".env" not in files
    assert not any(f.startswith("node_modules/") for f in files)
    assert result.files == len(files)

    env = (out / ".env.public").read_text()
    assert "COMPOSE_PROJECT_NAME=orders-api\nPLATFORM=linux/arm64\n" in env
    assert env.index("FLAGS_URL") < env.index("\n\n# containers") < env.index("PROJECT_NAME")  # layout preserved
    assert json.loads((out / "package.json").read_text())["name"] == "orders-api"
    project = json.loads((out / "project.json").read_text())
    assert project["sourceRoot"] == "backend/orders-api"
    assert {t["options"]["cwd"] for t in project["targets"].values()} == {"backend/orders-api"}
    assert "sample-tpl" not in (out / "src/core/core.ts").read_text()


def test_render_with_features_off(sample_template, tmp_path):
    out = tmp_path / "out"
    render_template(sample_template, out, {"name": "lean"}, {"flags": "none", "database": "none"})

    files = _files(out)
    assert not (out / "src/flags").exists()  # empty parent pruned
    assert "docker-compose/flags.yml" not in files and "docker-compose/db.yml" not in files
    env = (out / ".env.public").read_text()
    assert "FLAGS_URL" not in env and "# flags" not in env and "DB_USER" not in env
    make = (out / "Makefile").read_text()
    assert "launch-flags" not in make and "launch-db" not in make and "db-data" not in make
    assert ".PHONY: build lint \\\n\thelp\n" in make
    assert "FLAGS_URL" not in (out / "src/core/env.ts").read_text()


def test_render_refuses_non_empty_output(sample_template, tmp_path):
    out = tmp_path / "out"
    out.mkdir()
    (out / "keep.txt").write_text("x")
    with pytest.raises(ParameterError, match="not empty"):
        render_template(sample_template, out, {"name": "orders"})


def _break(template: Path, change) -> None:
    path = template / "template.yaml"
    data = yaml.safe_load(path.read_text())
    change(data)
    path.write_text(yaml.safe_dump(data, sort_keys=False))


@pytest.mark.parametrize(
    ("change", "location"),
    [
        (lambda d: d["features"]["flags"]["when"]["none"]["remove_files"].append("src/gone/"), "remove_files[2]"),
        (lambda d: d["features"]["flags"]["when"]["none"]["remove_env"].append("GONE"), "remove_env"),
        (lambda d: d["features"]["flags"]["when"]["none"]["remove_make_targets"].append("gone"), "remove_make_targets"),
        (
            lambda d: d["features"]["flags"]["when"]["none"]["remove_lines"].append(
                {"file": "README.md", "pattern": "^zz"}
            ),
            "remove_lines[2] (README.md)",
        ),
        (
            lambda d: d["features"]["database"]["when"]["none"]["replace"].append(
                {"file": "nope.txt", "find": "a", "with": "b"}
            ),
            "replace[1] (nope.txt)",
        ),
        (lambda d: d["identity"]["files"].append("docker-compose/db.yml"), "identity.files[5]"),
        (lambda d: d["edits"][1]["json_set"].update({"missing.key": "x"}), "edits[1] (project.json)"),
    ],
)
def test_stale_manifest_names_the_entry(sample_template, tmp_path, change, location):
    _break(sample_template, change)
    with pytest.raises(StaleManifestError, match=location.replace("[", r"\[").replace("(", r"\(").replace(")", r"\)")):
        render_template(sample_template, tmp_path / "out", {"name": "orders"}, {"flags": "none", "database": "none"})


def test_paths_cannot_escape_the_output(sample_template, tmp_path):
    _break(sample_template, lambda d: d["features"]["flags"]["when"]["none"]["remove_files"].append("../../etc"))
    with pytest.raises(ParameterError, match="escapes"):
        render_template(sample_template, tmp_path / "out", {"name": "orders"}, {"flags": "none"})


@pytest.mark.parametrize(
    ("path", "excluded"),
    [
        ("node_modules/a/index.js", True),
        ("packages/x/node_modules/a.js", True),
        ("CHANGELOG.md", True),
        ("docs/CHANGELOG.md", True),
        ("src/app.ts", False),
        ("dist", True),
        ("build/out/file", True),
        ("buildx/file", False),
        (".coverage", True),
    ],
)
def test_is_excluded(path, excluded):
    assert is_excluded(path, ["node_modules/", "CHANGELOG.md", "dist/", "build/out/", ".coverage"]) is excluded

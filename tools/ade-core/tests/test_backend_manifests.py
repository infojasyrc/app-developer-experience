"""Checks against the real backend templates (needs the ADE repo, mounted at /repo by the Makefile)."""

import json

from ade_core.application.combinations import discover_templates, github_matrix, validate
from ade_core.application.render import render_template
from ade_core.domain.manifest import load_manifest

TEMPLATES = {"fastapi-rest-tpl", "nestjs-rest-tpl", "nestjs-gql-tpl"}
COMMON_PARAMETERS = ["name", "project_name", "compose_project_name", "platform", "container_runtime", "output_dir"]
DEV_VARIABLES = ["PROJECT_NAME", "COMPOSE_PROJECT_NAME", "PLATFORM", "CONTAINER_RUNTIME"]


def test_every_backend_template_has_a_manifest(ade_root):
    assert {path.name for path in discover_templates(ade_root)} == TEMPLATES


def test_every_feature_combination_renders(ade_root):
    assert validate(list(discover_templates(ade_root))) == []
    assert len(github_matrix(ade_root)["include"]) == 12


def test_common_parameters_are_identical(ade_root):
    schemas = [load_manifest(path).parameters for path in discover_templates(ade_root)]
    for key in COMMON_PARAMETERS:
        assert len({json.dumps(schema["properties"][key], sort_keys=True) for schema in schemas}) == 1, key


def _src_mentions(root, word):
    return [p for p in (root / "src").rglob("*") if p.is_file() and word in p.read_text().lower()]


def test_nestjs_without_feature_flags_has_no_unleash(ade_root, tmp_path):
    for template in ("nestjs-rest-tpl", "nestjs-gql-tpl"):
        out = tmp_path / template
        render_template(ade_root / "backend" / template, out, {"name": "orders-api"}, {"feature_flags": "none"})
        assert _src_mentions(out, "unleash") == []
        assert not (out / "docker-compose/docker-compose.unleash.yml").exists()
        assert "unleash" not in (out / "Makefile").read_text()
        assert "unleash" not in (out / "docker-compose/docker-compose.yml").read_text()
        assert json.loads((out / "package.json").read_text())["name"] == "orders-api"


def test_fastapi_without_database_and_auth(ade_root, tmp_path):
    out = tmp_path / "svc"
    render_template(
        ade_root / "backend/fastapi-rest-tpl", out, {"name": "svc-api"}, {"database": "none", "auth": "none"}
    )
    assert "docker-compose.db.yml" not in (out / "Makefile").read_text()
    assert "jwt_" not in (out / "src/infrastructure/settings.py").read_text()
    assert 'APP_NAME: str = "svc-api"' in (out / "src/infrastructure/settings.py").read_text()
    compose = (out / "docker-compose/docker-compose.local.yml").read_text()
    assert "JWT_" not in compose and "depends_on" not in compose


def test_env_public_layout_is_preserved(ade_root, tmp_path):
    for template in TEMPLATES:
        out = tmp_path / template
        render_template(ade_root / "backend" / template, out, {"name": "orders-api"}, {})
        lines = (out / ".env.public").read_text().splitlines()
        keys = [line.split("=", 1)[0] for line in lines if "=" in line and not line.startswith("#")]
        assert keys[-4:] == DEV_VARIABLES, template
        assert lines[lines.index("PROJECT_NAME=app-dev-exp") - 2] == "", template  # blank line before dev block

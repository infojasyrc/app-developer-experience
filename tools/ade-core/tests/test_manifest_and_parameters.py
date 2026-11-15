from pathlib import Path

import pytest
import yaml

from ade_core.application.parameters import resolve_features, resolve_parameters, substitute
from ade_core.domain.errors import ManifestError, ParameterError
from ade_core.domain.manifest import load_manifest


def _rewrite(template: Path, change) -> None:
    path = template / "template.yaml"
    data = yaml.safe_load(path.read_text())
    change(data)
    path.write_text(yaml.safe_dump(data, sort_keys=False))


def test_load_manifest(sample_template):
    manifest = load_manifest(sample_template)
    assert manifest.artifact == "sample"
    assert manifest.package_key == "tpl-sample"
    assert list(manifest.features) == ["flags", "database"]
    assert manifest.features["database"].when["none"].replace[0].with_ == ""


def test_missing_manifest(tmp_path):
    with pytest.raises(ManifestError, match="not found"):
        load_manifest(tmp_path)


def test_invalid_yaml(tmp_path):
    (tmp_path / "template.yaml").write_text("a: [unclosed\n")
    with pytest.raises(ManifestError, match="invalid YAML"):
        load_manifest(tmp_path)


@pytest.mark.parametrize(
    ("change", "message"),
    [
        (lambda d: d["features"]["flags"].update(default="maybe"), "default 'maybe'"),
        (lambda d: d["features"]["flags"]["when"].update(other={}), "not declared"),
        (lambda d: d["edits"][0].update(json_set={"a": "b"}), "exactly one"),
        (lambda d: d["parameters"]["properties"].pop("name"), "declare 'name'"),
        (lambda d: d.update(parameters={"type": "string"}), "JSON Schema object"),
        (lambda d: d.update(unexpected=True), "unexpected"),
        (lambda d: d.update(min_engine_version="9.0.0"), "requires engine >= 9.0.0"),
    ],
)
def test_manifest_schema_errors(sample_template, change, message):
    _rewrite(sample_template, change)
    with pytest.raises(ManifestError, match=message):
        load_manifest(sample_template)


def test_parameters_defaults_reference_other_parameters(sample_template):
    params = resolve_parameters(load_manifest(sample_template), {"name": "orders-api", "http_port": "4100"})
    assert params["compose_project_name"] == "orders-api"
    assert params["output_dir"] == "backend/orders-api"
    assert params["http_port"] == 4100


@pytest.mark.parametrize(
    ("given", "message"),
    [
        ({"name": "Orders"}, "does not match"),
        ({"name": "orders", "http_port": "80"}, "less than the minimum"),
        ({"name": "orders", "http_port": "abc"}, "not an integer"),
        ({"name": "orders", "colour": "red"}, "unknown parameters"),
        ({"name": "orders", "platform": "windows"}, "is not one of"),
        ({}, r"missing required parameters for sample: \['name'\]"),
    ],
)
def test_parameter_errors(sample_template, given, message):
    with pytest.raises(ParameterError, match=message):
        resolve_parameters(load_manifest(sample_template), given)


def test_defaults_that_cannot_resolve(sample_template):
    _rewrite(sample_template, lambda d: d["parameters"]["properties"]["project_name"].update(default="{{ nope }}"))
    with pytest.raises(ParameterError, match="cannot resolve defaults"):
        resolve_parameters(load_manifest(sample_template), {"name": "orders"})


def test_substitute_unknown_placeholder():
    assert substitute("x-{{ a }}", {"a": 1}) == "x-1"
    with pytest.raises(ParameterError, match="unknown placeholder"):
        substitute("{{ b }}", {})


def test_features_defaults_and_validation(sample_template):
    manifest = load_manifest(sample_template)
    assert resolve_features(manifest, {}) == {"flags": "enabled", "database": "postgres"}
    assert resolve_features(manifest, {"database": "none"})["database"] == "none"
    with pytest.raises(ParameterError, match="not supported"):
        resolve_features(manifest, {"database": "mysql"})
    with pytest.raises(ParameterError, match="unknown features"):
        resolve_features(manifest, {"cache": "redis"})

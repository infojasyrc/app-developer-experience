import json

import pytest
import yaml

from ade_core.adapters.inspector import inspect_project, read_dotenv
from ade_core.adapters.sources.local import LOCAL_VERSION, LocalSource
from ade_core.application.scaffold import apply_scaffold, plan_scaffold
from ade_core.domain.errors import ParameterError
from ade_core.domain.receipt import load_receipt


@pytest.fixture
def monorepo(tmp_path):
    root = tmp_path / "monorepo"
    (root / "backend" / "billing").mkdir(parents=True)
    (root / "nx.json").write_text("{}")
    (root / ".env.public").write_text("PROJECT_NAME=acme\nPLATFORM=linux/arm64\nCONTAINER_RUNTIME=wasm\n")
    (root / "backend" / "billing" / ".env.public").write_text("HTTP_PORT=4000\n")
    return root


def test_inspector(monorepo, tmp_path):
    ctx = inspect_project(monorepo)
    assert ctx.layout == "monorepo"
    assert ctx.detected == {"platform": "linux/arm64", "container_runtime": "wasm", "project_name": "acme"}
    assert ctx.used_ports == {4000: "backend/billing"}
    assert ctx.default_output_dir("orders") == "backend/orders"
    assert ctx.free_port(4000) == 4001
    standalone = inspect_project(tmp_path / "empty")
    assert standalone.layout == "standalone" and standalone.default_output_dir("orders") == "orders"
    assert read_dotenv(tmp_path / "nope") == {}


def test_plan_writes_nothing_then_apply_writes_tree_and_receipt(sample_template, monorepo):
    plan = plan_scaffold(LocalSource(sample_template), "sample", monorepo, {"name": "orders-api"}, {"flags": "none"})
    assert plan.output_dir == "backend/orders-api"
    assert not plan.destination.exists()
    assert not (monorepo / ".ade").exists()
    assert plan.parameters["project_name"] == "acme"
    assert plan.parameters["platform"] == "linux/arm64"
    assert plan.parameters["container_runtime"] == "docker"  # detected value not allowed by the enum
    assert plan.parameters["http_port"] == 4001
    assert any("4000 is used by backend/billing" in w for w in plan.warnings)
    assert any("ignored detected container_runtime" in w for w in plan.warnings)
    assert "src/flags/flags.ts" not in plan.files and ".env.public" in plan.files
    assert plan.to_dict()["file_count"] == len(plan.files)

    destination = apply_scaffold(plan, cli_version="0.3.0")
    assert destination == (monorepo / "backend" / "orders-api").resolve()
    env = (destination / ".env.public").read_text()
    assert "HTTP_PORT=4001" in env and "COMPOSE_PROJECT_NAME=orders-api" in env
    assert json.loads((destination / "project.json").read_text())["sourceRoot"] == "backend/orders-api"
    assert not plan.staging_dir.exists()

    receipt = load_receipt(monorepo)
    assert receipt.cli_version == "0.3.0"
    (entry,) = receipt.artifacts
    assert (entry.artifact, entry.version, entry.output_dir) == ("sample", LOCAL_VERSION, "backend/orders-api")
    assert entry.features == {"flags": "none", "database": "postgres"}


def test_explicit_values_win_and_answers_file(sample_template, monorepo):
    answers = {"name": "orders-api", "http_port": 4000, "features": {"database": "none"}}
    plan = plan_scaffold(LocalSource(sample_template), "sample", monorepo, {"platform": "linux/amd64"}, answers=answers)
    assert plan.parameters["http_port"] == 4000
    assert plan.parameters["platform"] == "linux/amd64"
    assert plan.features["database"] == "none"
    assert any("already used by backend/billing" in w for w in plan.warnings)
    plan.discard()


def test_standalone_and_custom_output_dir(sample_template, tmp_path):
    target = tmp_path / "standalone"
    target.mkdir()
    plan = plan_scaffold(LocalSource(sample_template), "sample", target, {"name": "orders-api"})
    assert plan.output_dir == "orders-api" and plan.layout == "standalone"
    apply_scaffold(plan)
    custom = plan_scaffold(
        LocalSource(sample_template), "sample", target, {"name": "billing"}, output_dir="services/billing"
    )
    apply_scaffold(custom)
    receipt = yaml.safe_load((target / ".ade" / "answers.yaml").read_text())
    assert [a["output_dir"] for a in receipt["artifacts"]] == ["orders-api", "services/billing"]


@pytest.mark.parametrize("bad", ["/abs", "../outside", ".", "a/../.."])
def test_output_dir_must_stay_inside(sample_template, tmp_path, bad):
    with pytest.raises(ParameterError):
        plan_scaffold(LocalSource(sample_template), "sample", tmp_path, {"name": "orders-api"}, output_dir=bad)


def test_refuses_non_empty_destination(sample_template, tmp_path):
    (tmp_path / "orders-api").mkdir()
    (tmp_path / "orders-api" / "keep.txt").write_text("x")
    with pytest.raises(ParameterError, match="not empty"):
        plan_scaffold(LocalSource(sample_template), "sample", tmp_path, {"name": "orders-api"})


def test_apply_refuses_when_destination_filled_after_plan(sample_template, tmp_path):
    plan = plan_scaffold(LocalSource(sample_template), "sample", tmp_path, {"name": "orders-api"})
    (tmp_path / "orders-api").mkdir()
    (tmp_path / "orders-api" / "late.txt").write_text("x")
    with pytest.raises(ParameterError, match="not empty"):
        apply_scaffold(plan)
    plan.discard()


def test_empty_destination_is_reused(sample_template, tmp_path):
    (tmp_path / "orders-api").mkdir()
    plan = plan_scaffold(LocalSource(sample_template), "sample", tmp_path, {"name": "orders-api"})
    assert (apply_scaffold(plan) / "template.yaml").exists() is False


def test_missing_name_and_bad_feature_cleanup(sample_template, tmp_path):
    with pytest.raises(ParameterError, match="name"):
        plan_scaffold(LocalSource(sample_template), "sample", tmp_path, {})
    with pytest.raises(ParameterError, match="not supported"):
        plan_scaffold(LocalSource(sample_template), "sample", tmp_path, {"name": "orders-api"}, {"flags": "maybe"})

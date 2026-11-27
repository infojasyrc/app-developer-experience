"""`appdevexp new service`: plan, confirm, then apply a backend template (analysis §7.2).

Parameter precedence: flags > --answers file > detected from the target repo > manifest defaults.
Nothing is written until the plan is approved (--yes, or the confirmation prompt).
"""

from __future__ import annotations

import json
from pathlib import Path

import click
import inquirer
import yaml
from ade_core.application.scaffold import ScaffoldPlan, apply_scaffold, plan_scaffold
from ade_core.domain.errors import AdeCoreError
from ade_core.domain.manifest import load_manifest
from ade_core.domain.versions import split_artifact_spec

from commands.common import build_source, fail, is_interactive, parse_pairs, source_options
from constants import CLI_VERSION


@click.group(name="new")
def new():
    """Create a new project from an ADE template."""


def _load_answers(path: str | None) -> tuple[str | None, dict]:
    if not path:
        return None, {}
    data = yaml.safe_load(Path(path).read_text(encoding="utf-8")) or {}
    if not isinstance(data, dict):
        raise click.BadParameter("must be a YAML mapping", param_hint="--answers")
    answers = dict(data.get("parameters") or {})
    if data.get("features"):
        answers["features"] = dict(data["features"])
    return data.get("template"), answers


def _ask_template(source) -> str:
    choices = [
        (f"{name}  ({item.latest}) {item.description}", name)
        for name, item in source.index().artifacts.items()
        if item.kind == "project-template"
    ]
    if not choices:
        raise click.ClickException("the source has no project templates")
    return inquirer.prompt([inquirer.List("template", message="Template", choices=choices)])["template"]


def _ask_missing(source, template_ref: str, name: str | None, features: dict, answers: dict) -> tuple[str, dict]:
    if not name:
        name = inquirer.prompt([inquirer.Text("name", message="Service name (kebab-case)")])["name"]
    artifact, spec = split_artifact_spec(template_ref)
    manifest = load_manifest(source.resolve(artifact, spec).template_dir)
    chosen = dict(features)
    known = {**(answers.get("features") or {}), **chosen}
    for key, feature in manifest.features.items():
        if key in known:
            continue
        label = f"{key} ({feature.description})" if feature.description else key
        question = inquirer.List(key, message=label, choices=feature.values, default=feature.default)
        chosen[key] = inquirer.prompt([question])[key]
    return name, chosen


def _print_plan(plan: ScaffoldPlan) -> None:
    click.echo(f"Plan ({plan.artifact}@{plan.version} → {plan.output_dir})")
    click.echo(f"  source    {plan.origin}")
    click.echo(f"  layout    {plan.layout} ({plan.target_root})")
    click.echo(f"  + {plan.output_dir}/   {len(plan.files)} files")
    click.echo(f"  features  {' '.join(f'{k}={v}' for k, v in plan.features.items()) or '-'}")
    shown = ("project_name", "compose_project_name", "platform", "container_runtime", "http_port")
    params = " ".join(f"{k}={plan.parameters[k]}" for k in shown if k in plan.parameters)
    if params:
        click.echo(f"  params    {params}")
    click.echo("  + .ade/answers.yaml")
    for warning in plan.warnings:
        click.echo(f"  ⚠ {warning}")


@new.command(name="service")
@click.option("-t", "--template", "template_ref", help="Template, optionally with a version: nestjs-rest@^0.3")
@click.option("-n", "--name", help="Service name (kebab-case).")
@click.option("-f", "--feature", "features", multiple=True, metavar="KEY=VALUE", help="Feature value (repeatable).")
@click.option("-p", "--param", "params", multiple=True, metavar="KEY=VALUE", help="Template parameter (repeatable).")
@click.option("-o", "--output-dir", help="Destination relative to --target (default: backend/<name> or <name>).")
@click.option("--target", default=".", show_default=True, type=click.Path(file_okay=False), help="Repository root.")
@click.option("--answers", "answers_file", type=click.Path(exists=True, dir_okay=False), help="Answers YAML file.")
@source_options
@click.option("--dry-run", is_flag=True, help="Show the plan and write nothing.")
@click.option("-y", "--yes", is_flag=True, help="Apply without asking (non-interactive).")
@click.option("--format", "fmt", type=click.Choice(["text", "json"]), default="text", show_default=True)
def service(
    template_ref,
    name,
    features,
    params,
    output_dir,
    target,
    answers_file,
    source,
    registry,
    index_url,
    refresh,
    dry_run,
    yes,
    fmt,
):
    """Create a backend service from a template (fastapi-rest, nestjs-rest, nestjs-gql)."""
    interactive = is_interactive() and not yes and fmt == "text"
    feature_values = parse_pairs(features, "--feature")
    param_values = parse_pairs(params, "--param")
    answers_template, answers = _load_answers(answers_file)
    template_ref = template_ref or answers_template
    name = name or param_values.pop("name", None) or answers.get("name")

    plan = None
    try:
        artifact_source = build_source(source, registry, index_url, refresh)
        if not template_ref:
            if not interactive:
                raise click.UsageError("--template is required (or run in a terminal to choose one)")
            template_ref = _ask_template(artifact_source)
        if interactive:
            name, feature_values = _ask_missing(artifact_source, template_ref, name, feature_values, answers)
        if not name:
            raise click.UsageError("--name is required")

        plan = plan_scaffold(
            artifact_source,
            template_ref,
            Path(target),
            {**param_values, "name": name},
            feature_values,
            output_dir=output_dir,
            answers=answers,
        )
        if fmt == "text":
            _print_plan(plan)

        if dry_run:
            _finish(plan, fmt, applied=False)
            return
        if not yes:
            if not interactive:
                raise click.UsageError("pass --yes to apply without a terminal, or --dry-run to only see the plan")
            if not click.confirm("Apply?", default=False):
                _finish(plan, fmt, applied=False)
                return
        destination = apply_scaffold(plan, cli_version=CLI_VERSION)
        _finish(plan, fmt, applied=True, destination=destination)
    except AdeCoreError as exc:
        raise fail(exc) from exc
    finally:
        if plan is not None:
            plan.discard()


def _finish(plan: ScaffoldPlan, fmt: str, applied: bool, destination: Path | None = None) -> None:
    if fmt == "json":
        payload = {**plan.to_dict(), "applied": applied, "destination": str(destination) if destination else None}
        click.echo(json.dumps(payload, indent=2))
        return
    if not applied:
        click.echo("Nothing written.")
        return
    click.echo(f"✔ Written to {plan.output_dir} and recorded in .ade/answers.yaml.")
    if plan.next_steps:
        click.echo(f"Next steps (run from {plan.output_dir}):")
        for step in plan.next_steps:
            click.echo(f"  {step}")

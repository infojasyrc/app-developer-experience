"""`appdevexp list`: artifacts available from the source, with their versions."""

from __future__ import annotations

import json

import click
from ade_core.domain.errors import AdeCoreError

from commands.common import build_source, fail, source_options


@click.command(name="list")
@source_options
@click.option("--kind", default=None, help="Only show one kind (e.g. project-template).")
@click.option("--format", "fmt", type=click.Choice(["text", "json"]), default="text", show_default=True)
def list_artifacts(source, registry, index_url, refresh, kind, fmt):
    """List templates (and other artifacts) and their released versions."""
    try:
        artifact_source = build_source(source, registry, index_url, refresh)
        index = artifact_source.index()
    except AdeCoreError as exc:
        raise fail(exc) from exc

    items = {name: item for name, item in index.artifacts.items() if kind is None or item.kind == kind}
    if fmt == "json":
        payload = {name: item.model_dump(mode="json") for name, item in items.items()}
        click.echo(json.dumps(payload, indent=2))
        return
    for warning in getattr(artifact_source, "warnings", []):
        click.echo(f"⚠ {warning}", err=True)
    if not items:
        click.echo("No artifacts found.")
        return
    click.echo(f"{'ARTIFACT':<16} {'KIND':<18} {'LATEST':<12} VERSIONS")
    for name, item in items.items():
        click.echo(f"{name:<16} {item.kind:<18} {item.latest:<12} {', '.join(item.versions) or '-'}")
        if item.description:
            click.echo(f"{'':<16} {item.description}")

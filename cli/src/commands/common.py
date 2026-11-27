"""Options and helpers shared by the scaffolding commands (`list`, `new`)."""

from __future__ import annotations

import functools
import sys

import click
from ade_core.adapters.sources.github import DEFAULT_REGISTRY, INDEX_TTL_SECONDS, GitHubReleaseSource
from ade_core.adapters.sources.local import LocalSource
from ade_core.domain.errors import AdeCoreError
from ade_core.ports import ArtifactSource


def source_options(func):
    """--source / --registry / --index-url: where templates are resolved from."""

    @click.option(
        "--source",
        default="github",
        show_default=True,
        help="'github' (released bundles) or 'path:<template dir>' (an unreleased working copy).",
    )
    @click.option(
        "--registry",
        default=DEFAULT_REGISTRY,
        show_default=True,
        envvar="APPDEVEXP_REGISTRY",
        help="GitHub owner/repo that publishes the releases (forks, mirrors).",
    )
    @click.option(
        "--index-url",
        default=None,
        envvar="APPDEVEXP_INDEX_URL",
        help="Override the artifacts-index.json URL (https:// or file://).",
    )
    @click.option("--refresh", is_flag=True, help="Ignore the cached artifacts index (cached for 24h).")
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)

    return wrapper


def build_source(source: str, registry: str, index_url: str | None, refresh: bool = False) -> ArtifactSource:
    if source.startswith("path:"):
        return LocalSource(source.removeprefix("path:"))
    if source == "github":
        ttl = 0 if refresh else INDEX_TTL_SECONDS
        return GitHubReleaseSource(registry=registry, index_url=index_url, ttl_seconds=ttl)
    raise click.BadParameter("use 'github' or 'path:<template dir>'", param_hint="--source")


def parse_pairs(items: tuple[str, ...], flag: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for item in items:
        key, sep, value = item.partition("=")
        if not sep or not key:
            raise click.BadParameter(f"expected key=value, got '{item}'", param_hint=flag)
        result[key.strip()] = value.strip()
    return result


def is_interactive() -> bool:
    return sys.stdin.isatty() and sys.stdout.isatty()


def fail(exc: AdeCoreError) -> click.ClickException:
    return click.ClickException(str(exc))

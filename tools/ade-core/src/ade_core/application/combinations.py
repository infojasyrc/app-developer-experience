"""Enumerate every feature combination of the backend template manifests (for CI and validation)."""

from __future__ import annotations

import itertools
import tempfile
from dataclasses import dataclass
from pathlib import Path

from ade_core.application.render import render_template
from ade_core.domain.errors import AdeCoreError
from ade_core.domain.manifest import MANIFEST_FILE, Manifest, load_manifest

ENGINE_PACKAGE_KEY = "ade-core"


@dataclass(frozen=True)
class Combination:
    template: str  # directory name under backend/
    artifact: str
    features: dict[str, str]

    @property
    def name(self) -> str:
        """Deterministic project name, valid for the `name` parameter (e.g. nestjs-rest-none-postgres)."""
        return "-".join([self.artifact, *self.features.values()])

    @property
    def features_arg(self) -> str:
        return " ".join(f"{key}={value}" for key, value in self.features.items())


def discover_templates(repo_root: Path) -> dict[Path, Manifest]:
    return {
        path.parent: load_manifest(path.parent) for path in sorted((repo_root / "backend").glob(f"*/{MANIFEST_FILE}"))
    }


def combinations_for(template_dir: Path, manifest: Manifest) -> list[Combination]:
    names = list(manifest.features)
    value_sets = [manifest.features[name].values for name in names]
    return [
        Combination(template=template_dir.name, artifact=manifest.artifact, features=dict(zip(names, values)))
        for values in itertools.product(*value_sets)
    ]


def select_templates(templates: dict[Path, Manifest], packages: str) -> dict[Path, Manifest]:
    """Filter by changed package keys; empty input or an engine change selects every template."""
    keys = set(packages.split())
    if not keys or ENGINE_PACKAGE_KEY in keys:
        return templates
    return {path: manifest for path, manifest in templates.items() if manifest.package_key in keys}


def github_matrix(repo_root: Path, packages: str = "") -> dict:
    selected = select_templates(discover_templates(repo_root), packages)
    include = [
        {"template": combo.template, "name": combo.name, "features": combo.features_arg}
        for path, manifest in selected.items()
        for combo in combinations_for(path, manifest)
    ]
    return {"include": include}


def validate(template_dirs: list[Path]) -> list[str]:
    """Render every combination of every template into a scratch dir; return one message per failure."""
    failures: list[str] = []
    for template_dir in template_dirs:
        try:
            manifest = load_manifest(template_dir)
        except AdeCoreError as exc:
            failures.append(str(exc))
            continue
        for combo in combinations_for(template_dir, manifest):
            with tempfile.TemporaryDirectory() as scratch:
                try:
                    render_template(template_dir, Path(scratch) / combo.name, {"name": combo.name}, combo.features)
                except AdeCoreError as exc:
                    failures.append(f"[{combo.name}] {exc}")
    return failures

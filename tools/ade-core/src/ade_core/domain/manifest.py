"""template.yaml model (manifest_schema 1).

A manifest describes deterministic transforms over a *living, runnable*
template: the template itself stays buildable and testable in ADE CI, and the
manifest only says how to rename it and how to strip optional features.
"""

from __future__ import annotations

from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator

from ade_core import __version__
from ade_core.domain.errors import ManifestError

MANIFEST_FILE = "template.yaml"


class _Strict(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class RemoveLines(_Strict):
    file: str
    pattern: str


class Replace(_Strict):
    file: str
    find: str
    with_: str = Field(alias="with")


class Transforms(_Strict):
    """Operations applied when a feature takes a given value. Every op must match."""

    remove_files: list[str] = []
    remove_env: list[str] = []
    remove_make_targets: list[str] = []
    remove_lines: list[RemoveLines] = []
    replace: list[Replace] = []


class Feature(_Strict):
    description: str = ""
    values: list[str]
    default: str
    when: dict[str, Transforms] = {}

    @model_validator(mode="after")
    def _check_values(self) -> "Feature":
        if self.default not in self.values:
            raise ValueError(f"default '{self.default}' is not one of {self.values}")
        unknown = set(self.when) - set(self.values)
        if unknown:
            raise ValueError(f"'when' has values that are not declared: {sorted(unknown)}")
        return self


class Identity(_Strict):
    token: str
    files: list[str]


class Edit(_Strict):
    file: str
    dotenv_set: dict[str, str] | None = None
    json_set: dict[str, str] | None = None

    @model_validator(mode="after")
    def _one_operation(self) -> "Edit":
        if (self.dotenv_set is None) == (self.json_set is None):
            raise ValueError("an edit needs exactly one of dotenv_set or json_set")
        return self


class Manifest(_Strict):
    manifest_schema: Literal[1]
    artifact: str
    kind: Literal["project-template"]
    min_engine_version: str
    description: str
    env_file: str = ".env.public"
    makefile: str = "Makefile"
    identity: Identity
    exclude: list[str] = []
    parameters: dict
    features: dict[str, Feature] = {}
    edits: list[Edit] = []
    next_steps: list[str] = []

    @model_validator(mode="after")
    def _check_parameters(self) -> "Manifest":
        if self.parameters.get("type") != "object" or "properties" not in self.parameters:
            raise ValueError("parameters must be a JSON Schema object with 'properties'")
        if "name" not in self.parameters["properties"]:
            raise ValueError("parameters must declare 'name'")
        return self

    @property
    def package_key(self) -> str:
        """Key used by .github/actions/get-changed-packages (e.g. tpl-nestjs-rest)."""
        return f"tpl-{self.artifact}"


def _version_tuple(version: str) -> tuple[int, ...]:
    return tuple(int(part) for part in version.split("."))


def load_manifest(template_dir: Path) -> Manifest:
    path = Path(template_dir) / MANIFEST_FILE
    if not path.is_file():
        raise ManifestError(f"{path}: not found")
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        manifest = Manifest.model_validate(data)
    except yaml.YAMLError as exc:
        raise ManifestError(f"{path}: invalid YAML: {exc}") from exc
    except ValidationError as exc:
        raise ManifestError(f"{path}: {exc}") from exc
    if _version_tuple(manifest.min_engine_version) > _version_tuple(__version__):
        raise ManifestError(f"{path}: requires engine >= {manifest.min_engine_version}, this is ade-core {__version__}")
    return manifest

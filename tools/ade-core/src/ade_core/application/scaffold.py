"""PlanScaffold / ApplyScaffold use cases (analysis §3.3, §7.2).

plan:  resolve artifact@spec from a source -> inspect the target repo -> resolve
       parameters (explicit > answers file > detected > manifest default) ->
       render into a private staging dir. Nothing is written in the target.
apply: move the staged tree to <target>/<output_dir> (refusing a non-empty
       destination) and upsert <target>/.ade/answers.yaml.
"""

from __future__ import annotations

import shutil
import tempfile
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any

from ade_core import __version__
from ade_core.adapters.inspector import ProjectContext, inspect_project
from ade_core.application.parameters import resolve_parameters
from ade_core.application.render import render_template
from ade_core.domain.errors import ParameterError
from ade_core.domain.manifest import Manifest, load_manifest
from ade_core.domain.receipt import Receipt, ReceiptEntry, load_receipt, save_receipt
from ade_core.domain.versions import split_artifact_spec
from ade_core.ports import ArtifactSource


@dataclass
class ScaffoldPlan:
    artifact: str
    version: str
    origin: str
    target_root: Path
    output_dir: str
    layout: str
    staging_dir: Path
    files: list[str]
    parameters: dict[str, Any]
    features: dict[str, str]
    next_steps: list[str]
    warnings: list[str] = field(default_factory=list)

    @property
    def destination(self) -> Path:
        return self.target_root / self.output_dir

    def to_dict(self) -> dict[str, Any]:
        return {
            "artifact": self.artifact,
            "version": self.version,
            "origin": self.origin,
            "target_root": str(self.target_root),
            "output_dir": self.output_dir,
            "layout": self.layout,
            "files": self.files,
            "file_count": len(self.files),
            "parameters": self.parameters,
            "features": self.features,
            "next_steps": self.next_steps,
            "warnings": self.warnings,
        }

    def discard(self) -> None:
        shutil.rmtree(self.staging_dir.parent, ignore_errors=True)


def _normalize_output_dir(value: str) -> str:
    path = PurePosixPath(value.replace("\\", "/"))
    if path.is_absolute() or ".." in path.parts or str(path) in ("", "."):
        raise ParameterError(f"output directory must be a relative path inside the target: '{value}'")
    return path.as_posix()


def _confine(root: Path, rel: str) -> Path:
    candidate = (root / rel).resolve()
    if candidate == root.resolve() or not candidate.is_relative_to(root.resolve()):
        raise ParameterError(f"output directory escapes the target: {rel}")
    return candidate


def _not_empty(path: Path) -> bool:
    return path.exists() and (not path.is_dir() or any(path.iterdir()))


def _detected_parameters(manifest: Manifest, context: ProjectContext, warnings: list[str]) -> dict[str, Any]:
    properties = manifest.parameters["properties"]
    accepted = {}
    for key, value in context.detected.items():
        spec = properties.get(key)
        if spec is None:
            continue
        if "enum" in spec and value not in spec["enum"]:
            warnings.append(f"ignored detected {key}={value} (not one of {spec['enum']})")
            continue
        accepted[key] = value
    return accepted


def _merge(*layers: dict[str, Any]) -> dict[str, Any]:
    merged: dict[str, Any] = {}
    for layer in layers:
        merged.update({k: v for k, v in layer.items() if v is not None})
    return merged


def _choose_port(
    manifest: Manifest, params: dict[str, Any], explicit: set[str], ctx: ProjectContext, warnings: list[str]
) -> None:
    if "http_port" not in manifest.parameters["properties"]:
        return
    wanted = int(params["http_port"])
    owner = ctx.used_ports.get(wanted)
    if owner is None:
        return
    if "http_port" in explicit:
        warnings.append(f"HTTP_PORT {wanted} is already used by {owner}")
        return
    port = ctx.free_port(wanted)
    params["http_port"] = port
    warnings.append(f"HTTP_PORT {wanted} is used by {owner}; using {port}")


def plan_scaffold(
    source: ArtifactSource,
    artifact_ref: str,
    target_root: Path,
    parameters: dict[str, Any] | None = None,
    features: dict[str, str] | None = None,
    output_dir: str | None = None,
    answers: dict[str, Any] | None = None,
) -> ScaffoldPlan:
    """Render artifact_ref (`name[@spec]`) for target_root into a staging dir and describe the result."""
    target_root = Path(target_root).resolve()
    given = dict(parameters or {})
    answers = dict(answers or {})
    answer_features = dict(answers.pop("features", None) or {})
    if not given.get("name") and not answers.get("name"):
        raise ParameterError("missing required parameter: name")

    artifact, spec = split_artifact_spec(artifact_ref)
    resolved = source.resolve(artifact, spec)
    manifest = load_manifest(resolved.template_dir)
    warnings = list(resolved.warnings)

    context = inspect_project(target_root)
    explicit = set(given) | set(answers)
    params = _merge(_detected_parameters(manifest, context, warnings), answers, given)
    name = str(params["name"])
    output = _normalize_output_dir(output_dir or str(params.get("output_dir") or context.default_output_dir(name)))
    if "output_dir" in manifest.parameters["properties"]:
        params["output_dir"] = output

    params = resolve_parameters(manifest, params)
    _choose_port(manifest, params, explicit, context, warnings)
    params = resolve_parameters(manifest, params)

    if _not_empty(_confine(target_root, output)):
        raise ParameterError(f"destination already exists and is not empty: {output}")

    staging_parent = Path(tempfile.mkdtemp(prefix="appdevexp-plan-"))
    staging = staging_parent / "out"
    try:
        result = render_template(resolved.template_dir, staging, params, {**answer_features, **(features or {})})
    except Exception:
        shutil.rmtree(staging_parent, ignore_errors=True)
        raise
    files = sorted(p.relative_to(staging).as_posix() for p in staging.rglob("*") if p.is_file())
    return ScaffoldPlan(
        artifact=artifact,
        version=resolved.version,
        origin=resolved.origin,
        target_root=target_root,
        output_dir=output,
        layout=context.layout,
        staging_dir=staging,
        files=files,
        parameters=result.parameters,
        features=result.features,
        next_steps=result.next_steps,
        warnings=warnings,
    )


def apply_scaffold(plan: ScaffoldPlan, cli_version: str | None = None) -> Path:
    """Write the planned tree and the receipt. Returns the destination directory."""
    destination = _confine(plan.target_root, plan.output_dir)
    if _not_empty(destination):
        raise ParameterError(f"destination already exists and is not empty: {plan.output_dir}")
    if destination.exists():
        destination.rmdir()
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(plan.staging_dir), str(destination))
    plan.discard()

    receipt = load_receipt(plan.target_root) or Receipt(engine_version=__version__)
    receipt.engine_version = __version__
    if cli_version:
        receipt.cli_version = cli_version
    receipt.upsert(
        ReceiptEntry(
            artifact=plan.artifact,
            version=plan.version,
            source=plan.origin,
            output_dir=plan.output_dir,
            parameters=plan.parameters,
            features=plan.features,
            generated_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        )
    )
    save_receipt(plan.target_root, receipt)
    return destination

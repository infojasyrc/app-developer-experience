"""RenderTemplate use case: template dir + parameters + features -> new project dir.

Order: copy (minus excludes) -> feature transforms (written against the
template's original text) -> identity rename -> edits. Every transform must
match; a miss raises StaleManifestError naming the manifest entry.
"""

from __future__ import annotations

import fnmatch
import shutil
from dataclasses import dataclass, field
from pathlib import Path, PurePosixPath
from typing import Any, Callable

from ade_core.adapters.transforms import dotenv, json_edit, makefile, text
from ade_core.application.parameters import resolve_features, resolve_parameters, substitute
from ade_core.domain.errors import ParameterError, StaleManifestError
from ade_core.domain.manifest import MANIFEST_FILE, Manifest, Transforms, load_manifest

ALWAYS_EXCLUDED = [MANIFEST_FILE, ".git/", ".env"]


@dataclass
class RenderResult:
    artifact: str
    out_dir: Path
    parameters: dict[str, Any]
    features: dict[str, str]
    files: int
    next_steps: list[str] = field(default_factory=list)


def is_excluded(rel_path: str, patterns: list[str]) -> bool:
    path = PurePosixPath(rel_path)
    for pattern in patterns:
        if pattern.endswith("/"):
            directory = pattern.rstrip("/")
            if "/" in directory:
                if rel_path == directory or rel_path.startswith(f"{directory}/"):
                    return True
            elif directory in path.parts[:-1] or path.name == directory:
                return True
        elif fnmatch.fnmatch(rel_path, pattern) or ("/" not in pattern and fnmatch.fnmatch(path.name, pattern)):
            return True
    return False


def _copy_tree(source: Path, target: Path, patterns: list[str]) -> int:
    count = 0
    for item in sorted(source.rglob("*")):
        rel = item.relative_to(source).as_posix()
        if is_excluded(rel, patterns) or item.is_dir():
            continue
        destination = target / rel
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(item, destination, follow_symlinks=False)
        count += 1
    return count


def _inside(root: Path, rel: str) -> Path:
    candidate = (root / rel).resolve()
    if not candidate.is_relative_to(root.resolve()):
        raise ParameterError(f"path escapes the output directory: {rel}")
    return candidate


def _edit_file(root: Path, rel: str, change: Callable[[str], str]) -> None:
    path = _inside(root, rel)
    if not path.is_file():
        raise StaleManifestError(f"file not found: {rel}")
    path.write_text(change(path.read_text(encoding="utf-8")), encoding="utf-8")


def _prune_empty_parents(root: Path, directory: Path) -> None:
    """Remove directories left empty by a removal, up to (not including) the output root."""
    root = root.resolve()
    while directory != root and directory.is_relative_to(root) and not any(directory.iterdir()):
        directory.rmdir()
        directory = directory.parent


def _located(where: str, action: Callable[[], None]) -> None:
    try:
        action()
    except StaleManifestError as exc:
        raise StaleManifestError(f"{where}: {exc}") from exc


def _apply_transforms(manifest: Manifest, root: Path, transforms: Transforms, where: str) -> None:
    for i, rel in enumerate(transforms.remove_files):

        def _remove(rel: str = rel) -> None:
            path = _inside(root, rel.rstrip("/"))
            if path.is_dir():
                shutil.rmtree(path)
            elif path.exists():
                path.unlink()
            else:
                raise StaleManifestError(f"path not found: {rel}")
            _prune_empty_parents(root, path.parent)

        _located(f"{where}.remove_files[{i}]", _remove)
    if transforms.remove_env:
        _located(
            f"{where}.remove_env",
            lambda: _edit_file(root, manifest.env_file, lambda t: dotenv.remove_keys(t, transforms.remove_env)),
        )
    if transforms.remove_make_targets:
        _located(
            f"{where}.remove_make_targets",
            lambda: _edit_file(
                root, manifest.makefile, lambda t: makefile.remove_targets(t, transforms.remove_make_targets)
            ),
        )
    for i, op in enumerate(transforms.remove_lines):
        _located(
            f"{where}.remove_lines[{i}] ({op.file})",
            lambda op=op: _edit_file(root, op.file, lambda t: text.remove_matching_lines(t, op.pattern)),
        )
    for i, op in enumerate(transforms.replace):
        _located(
            f"{where}.replace[{i}] ({op.file})",
            lambda op=op: _edit_file(root, op.file, lambda t: text.replace_literal(t, op.find, op.with_)),
        )


def _prepare_out_dir(out_dir: Path) -> None:
    if out_dir.exists() and any(out_dir.iterdir()):
        raise ParameterError(f"output directory is not empty: {out_dir}")
    out_dir.mkdir(parents=True, exist_ok=True)


def render_template(
    template_dir: Path,
    out_dir: Path,
    parameters: dict[str, Any],
    features: dict[str, str] | None = None,
) -> RenderResult:
    template_dir, out_dir = Path(template_dir), Path(out_dir)
    manifest = load_manifest(template_dir)
    chosen = resolve_features(manifest, features or {})
    params = resolve_parameters(manifest, parameters)

    _prepare_out_dir(out_dir)
    files = _copy_tree(template_dir, out_dir, ALWAYS_EXCLUDED + manifest.exclude)

    for name, value in chosen.items():
        transforms = manifest.features[name].when.get(value)
        if transforms:
            _apply_transforms(manifest, out_dir, transforms, f"{manifest.artifact}: features.{name}.when.{value}")

    token, new_name = manifest.identity.token, str(params["name"])
    for i, rel in enumerate(manifest.identity.files):
        _located(
            f"{manifest.artifact}: identity.files[{i}] ({rel})",
            lambda rel=rel: _edit_file(out_dir, rel, lambda t: text.replace_literal(t, token, new_name)),
        )

    for i, edit in enumerate(manifest.edits):
        where = f"{manifest.artifact}: edits[{i}] ({edit.file})"
        if edit.dotenv_set is not None:
            values = {key: substitute(value, params) for key, value in edit.dotenv_set.items()}
            _located(
                where,
                lambda edit=edit, values=values: _edit_file(out_dir, edit.file, lambda t: dotenv.set_values(t, values)),
            )
        else:
            values = {key: substitute(value, params) for key, value in edit.json_set.items()}
            _located(
                where,
                lambda edit=edit, values=values: _edit_file(
                    out_dir, edit.file, lambda t: json_edit.set_paths(t, values)
                ),
            )

    return RenderResult(
        artifact=manifest.artifact,
        out_dir=out_dir,
        parameters=params,
        features=chosen,
        files=files,
        next_steps=list(manifest.next_steps),
    )

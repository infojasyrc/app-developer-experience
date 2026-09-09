from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml

STACK_MISMATCH = "stack-mismatch-django-vs-backend-templates"
SERVICE_STACKS = frozenset(
    {
        "nestjs",
        "fastapi",
        "django",
        "django-admin",
        "nestjs-rest",
        "nestjs-gql",
    }
)


def _default_reference_path() -> Path:
    return Path(__file__).resolve().parents[2] / "data" / "reference.yaml"


@lru_cache
def load_reference(path: Path | None = None) -> dict:
    reference_path = path or _default_reference_path()
    return yaml.safe_load(reference_path.read_text(encoding="utf-8"))


def _as_manifest(target_repo_manifest: dict | str) -> dict:
    if isinstance(target_repo_manifest, str):
        return json.loads(target_repo_manifest)
    return dict(target_repo_manifest or {})


def _norm(value: str) -> str:
    return value.strip().lower().replace("\\", "/")


def _file_names(files: list[str]) -> set[str]:
    names: set[str] = set()
    for item in files:
        path = _norm(item)
        names.add(path)
        names.add(Path(path).name)
    return names


def _has_any(haystack: set[str], needles: list[str]) -> bool:
    wanted = {_norm(item) for item in needles}
    return bool(haystack.intersection(wanted))


def _is_iac_package(manifest: dict, stacks: set[str], iac: dict) -> bool:
    if _norm(str(manifest.get("package_kind") or "")) == "iac":
        return True
    package_stacks = {_norm(item) for item in iac.get("package_stacks") or []}
    return bool(stacks.intersection(package_stacks) and not stacks.intersection(SERVICE_STACKS))


def _is_conference_manager(manifest: dict, spec: dict) -> bool:
    identity = _norm(str(manifest.get("identity") or manifest.get("path") or ""))
    aliases = {_norm(item) for item in spec.get("match_aliases") or []}
    if identity in aliases or identity.rstrip("/") in aliases:
        return True
    for prefix in spec.get("match_paths") or []:
        if identity == _norm(prefix) or identity.startswith(_norm(prefix).rstrip("/") + "/"):
            return True
    return False


def _gap(category: str, code: str, detail: str) -> dict[str, str]:
    return {"category": category, "code": code, "detail": detail}


def compare_gaps(
    target_repo_manifest: dict | str,
    reference_path: Path | None = None,
) -> dict[str, Any]:
    """Diff a target repo manifest against the curated ADE reference set."""
    manifest = _as_manifest(target_repo_manifest)
    reference = load_reference(reference_path) if reference_path else load_reference()
    categories = reference.get("categories") or {}
    files = _file_names(list(manifest.get("files") or []))
    tools = {_norm(item) for item in manifest.get("tools") or []}
    targets = {_norm(item) for item in manifest.get("makefile_targets") or []}
    stacks = {_norm(item) for item in manifest.get("stack") or []}

    gaps: list[dict[str, str]] = []
    documented: list[dict[str, str]] = []

    commits = categories.get("commits") or {}
    commit_files = [_norm(item) for item in commits.get("file_signals") or []]
    commit_tools = [_norm(item) for item in commits.get("tool_signals") or []]
    if not (_has_any(files, commit_files) or tools.intersection(commit_tools)):
        gaps.append(
            _gap(
                "commits",
                "missing-conventional-commits",
                "No conventional-commits signal (commitlint, husky, or equivalent).",
            )
        )

    iac = categories.get("iac") or {}
    is_iac_package = _is_iac_package(manifest, stacks, iac)

    build = categories.get("build-tooling") or {}
    makefile_names = [_norm(item) for item in build.get("makefile_names") or ["makefile"]]
    has_makefile = _has_any(files, makefile_names)
    if not has_makefile:
        gaps.append(_gap("build-tooling", "missing-makefile", "New packages must ship a Makefile."))
    else:
        target_spec = (iac.get("targets") if is_iac_package else build.get("targets")) or {}
        for required in target_spec.get("required") or []:
            if _norm(required) not in targets:
                gaps.append(
                    _gap(
                        "build-tooling",
                        "missing-make-target",
                        f"Makefile is missing required target '{required}'.",
                    )
                )
        for group, options in (target_spec.get("required_one_of") or {}).items():
            if not any(_norm(option) in targets for option in options):
                allowed = ", ".join(options)
                gaps.append(
                    _gap(
                        "build-tooling",
                        "missing-make-target-group",
                        f"Makefile needs one of [{allowed}] for '{group}'.",
                    )
                )

    if not is_iac_package:
        container = categories.get("containerization") or {}
        dockerfiles = [_norm(item) for item in container.get("dockerfile_names") or ["dockerfile"]]
        if not _has_any(files, dockerfiles):
            gaps.append(_gap("containerization", "missing-dockerfile", "New packages must ship a Dockerfile."))

        wraps_host = bool(manifest.get("makefile_wraps_host_runtime"))
        wraps_docker = manifest.get("makefile_wraps_docker")
        if has_makefile and (wraps_host or wraps_docker is False):
            gaps.append(
                _gap(
                    "containerization",
                    "makefile-wraps-host-runtime",
                    "Makefile wraps host npm/python instead of Docker (Where You Build, You Run).",
                )
            )

    if not is_iac_package and manifest.get("expect_iac"):
        iac_tools = {_norm(item) for item in iac.get("tool_signals") or []}
        suffixes = [_norm(item) for item in iac.get("file_suffixes") or []]
        has_iac_file = any(name.endswith(tuple(suffixes)) for name in files)
        if not (tools.intersection(iac_tools) or has_iac_file):
            gaps.append(_gap("iac", "missing-iac", "Expected Terraform, Bicep, AWS SAM, or AWS CDK."))

    aligned = {_norm(item) for item in reference.get("aligned_backend_stacks") or []}
    django_like = bool(stacks.intersection({"django", "django-admin"}))
    stack_mismatch = django_like and not stacks.intersection(aligned)
    cm_spec = (reference.get("documented_exceptions") or {}).get("conference-manager") or {}
    if stack_mismatch and _is_conference_manager(manifest, cm_spec):
        documented.append(
            {
                "code": STACK_MISMATCH,
                "status": "documented_exception",
                "detail": (cm_spec.get("note") or "").strip(),
                "source": ".cursor/rules/000-core.mdc, .cursor/rules/conference-manager.mdc",
            }
        )
    elif stack_mismatch:
        gaps.append(
            _gap(
                "stack",
                STACK_MISMATCH,
                "Backend stack is Django; new services should bootstrap from FastAPI or NestJS templates.",
            )
        )

    return {
        "ok": True,
        "gaps": gaps,
        "documented_exceptions": documented,
        "gap_count": len(gaps),
    }

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import yaml


def _default_catalog_path() -> Path:
    return Path(__file__).resolve().parents[2] / "data" / "scaffold.yaml"


def _normalize(value: str) -> str:
    return value.strip().lower().replace("_", "-")


@lru_cache
def load_catalog(path: Path | None = None) -> dict:
    catalog_path = path or _default_catalog_path()
    return yaml.safe_load(catalog_path.read_text(encoding="utf-8"))


def known_component_types(catalog: dict | None = None) -> list[str]:
    data = catalog or load_catalog()
    return sorted(data.get("components", {}).keys())


def _lookup_not_template(component_type: str, catalog: dict) -> dict | None:
    query = _normalize(component_type)
    for name, spec in (catalog.get("not_templates") or {}).items():
        aliases = {_normalize(name), *(_normalize(item) for item in spec.get("aliases") or [])}
        if query in aliases:
            return {
                "ok": False,
                "is_template": False,
                "component_type": name,
                "error": spec.get("reason", "").strip(),
            }
    return None


def _lookup_component(component_type: str, catalog: dict) -> tuple[str, dict] | None:
    query = _normalize(component_type)
    for name, spec in (catalog.get("components") or {}).items():
        aliases = {_normalize(name), *(_normalize(item) for item in spec.get("aliases") or [])}
        if query in aliases:
            return name, spec
    return None


def scaffold_guidance(component_type: str, catalog_path: Path | None = None) -> dict:
    """Return which platform template to copy and the required Make/Docker flow."""
    catalog = load_catalog(catalog_path) if catalog_path else load_catalog()
    rejected = _lookup_not_template(component_type, catalog)
    if rejected:
        return rejected

    match = _lookup_component(component_type, catalog)
    if match is None:
        known = ", ".join(known_component_types(catalog))
        return {
            "ok": False,
            "is_template": False,
            "component_type": component_type,
            "error": (f"Unknown component_type '{component_type}'. " f"Known bootstrap templates: {known}."),
            "known_types": known_component_types(catalog),
        }

    name, spec = match
    lifecycle = catalog.get("lifecycle") or {}
    return {
        "ok": True,
        "is_template": True,
        "component_type": name,
        "path_alias": spec["path_alias"],
        "path": spec["path"],
        "description": spec.get("description", ""),
        "how": list(lifecycle.get("how") or []),
        "must_keep": list(lifecycle.get("must_keep") or []),
        "lifecycle": {
            "required": list(lifecycle.get("required") or []),
            "required_one_of": dict(lifecycle.get("required_one_of") or {}),
            "recommended": list(lifecycle.get("recommended") or []),
            "host_forbidden": list(lifecycle.get("host_forbidden") or []),
        },
    }

"""Structural JSON edits addressed by dotted paths; `*` matches every key of an object or item of a list."""

from __future__ import annotations

import json
from typing import Any

from ade_core.domain.errors import StaleManifestError


def _set(node: Any, parts: list[str], value: Any) -> int:
    """Set value at path under node; return how many leaves were set."""
    head, rest = parts[0], parts[1:]
    if head == "*":
        children = list(node.values()) if isinstance(node, dict) else node if isinstance(node, list) else []
        if not rest:
            raise StaleManifestError("'*' cannot be the last path segment")
        return sum(_set(child, rest, value) for child in children)
    if not isinstance(node, dict) or head not in node:
        return 0
    if not rest:
        node[head] = value
        return 1
    return _set(node[head], rest, value)


def set_paths(text: str, values: dict[str, Any]) -> str:
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise StaleManifestError(f"invalid JSON: {exc}") from exc
    for path, value in values.items():
        if _set(data, path.split("."), value) == 0:
            raise StaleManifestError(f"JSON path not found: {path}")
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"

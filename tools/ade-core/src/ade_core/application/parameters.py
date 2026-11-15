"""Resolve render parameters and feature values against a manifest.

Parameters: explicit values > JSON Schema defaults. Defaults may reference
other parameters with `{{ name }}` placeholders (no Jinja, no expressions).
"""

from __future__ import annotations

import re
from typing import Any

from jsonschema import Draft202012Validator

from ade_core.domain.errors import ParameterError
from ade_core.domain.manifest import Manifest

_PLACEHOLDER = re.compile(r"\{\{\s*([a-z_][a-z0-9_]*)\s*\}\}")


def substitute(value: str, params: dict[str, Any]) -> str:
    def _sub(match: re.Match[str]) -> str:
        key = match.group(1)
        if key not in params:
            raise ParameterError(f"unknown placeholder '{{{{ {key} }}}}'")
        return str(params[key])

    return _PLACEHOLDER.sub(_sub, value)


def _coerce(value: Any, schema: dict) -> Any:
    if isinstance(value, str) and schema.get("type") == "integer":
        try:
            return int(value)
        except ValueError as exc:
            raise ParameterError(f"'{value}' is not an integer") from exc
    return value


def resolve_parameters(manifest: Manifest, given: dict[str, Any]) -> dict[str, Any]:
    properties: dict[str, dict] = manifest.parameters["properties"]
    unknown = sorted(set(given) - set(properties))
    if unknown:
        raise ParameterError(f"unknown parameters for {manifest.artifact}: {unknown}")
    missing = sorted(set(manifest.parameters.get("required", [])) - set(given))
    if missing:
        raise ParameterError(f"missing required parameters for {manifest.artifact}: {missing}")

    params: dict[str, Any] = {key: _coerce(value, properties[key]) for key, value in given.items()}
    pending = {key: spec["default"] for key, spec in properties.items() if key not in params and "default" in spec}
    # Defaults can reference each other; resolve until stable (bounded by the number of defaults).
    for _ in range(len(pending) + 1):
        progressed = False
        for key, default in list(pending.items()):
            if isinstance(default, str):
                refs = set(_PLACEHOLDER.findall(default))
                if refs - set(params):
                    continue
                default = substitute(default, params)
            params[key] = _coerce(default, properties[key])
            del pending[key]
            progressed = True
        if not pending or not progressed:
            break
    if pending:
        raise ParameterError(f"cannot resolve defaults (missing or circular references): {sorted(pending)}")

    errors = sorted(Draft202012Validator(manifest.parameters).iter_errors(params), key=lambda e: list(e.path))
    if errors:
        details = "; ".join(f"{'.'.join(map(str, e.path)) or '<root>'}: {e.message}" for e in errors)
        raise ParameterError(f"invalid parameters for {manifest.artifact}: {details}")
    return params


def resolve_features(manifest: Manifest, given: dict[str, str]) -> dict[str, str]:
    unknown = sorted(set(given) - set(manifest.features))
    if unknown:
        raise ParameterError(
            f"unknown features for {manifest.artifact}: {unknown} (known: {sorted(manifest.features)})"
        )
    resolved = {}
    for name, feature in manifest.features.items():
        value = given.get(name, feature.default)
        if value not in feature.values:
            raise ParameterError(f"feature {name}={value} is not supported; choose one of {feature.values}")
        resolved[name] = value
    return resolved

"""dotenv edits that keep the file layout (order, comments, blank lines).

ADE's `.env.public` layout is a convention: service variables first, one blank
line, then PROJECT_NAME, COMPOSE_PROJECT_NAME, PLATFORM, CONTAINER_RUNTIME.
Editing values in place, never re-ordering, preserves it.
"""

from __future__ import annotations

import re

from ade_core.domain.errors import StaleManifestError

_KEY_LINE = re.compile(r"^(?P<key>[A-Za-z_][A-Za-z0-9_]*)=(?P<value>.*)$")


def _key_of(line: str) -> str | None:
    match = _KEY_LINE.match(line)
    return match.group("key") if match else None


def _missing(keys: set[str], lines: list[str]) -> list[str]:
    present = {_key_of(line) for line in lines}
    return sorted(key for key in keys if key not in present)


def set_values(text: str, values: dict[str, str]) -> str:
    lines = text.splitlines(keepends=True)
    missing = _missing(set(values), lines)
    if missing:
        raise StaleManifestError(f"dotenv keys not found: {missing}")
    out = []
    for line in lines:
        key = _key_of(line.rstrip("\r\n"))
        if key in values:
            ending = line[len(line.rstrip("\r\n")) :]
            line = f"{key}={values[key]}{ending}"
        out.append(line)
    return "".join(out)


def remove_keys(text: str, keys: list[str]) -> str:
    lines = text.splitlines(keepends=True)
    missing = _missing(set(keys), [line.rstrip("\r\n") for line in lines])
    if missing:
        raise StaleManifestError(f"dotenv keys not found: {missing}")
    return "".join(line for line in lines if _key_of(line.rstrip("\r\n")) not in set(keys))

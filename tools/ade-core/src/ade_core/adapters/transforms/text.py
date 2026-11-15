"""Generic strict text edits: literal replace and regex line removal."""

from __future__ import annotations

import re

from ade_core.domain.errors import StaleManifestError


def replace_literal(text: str, find: str, replacement: str) -> str:
    if find not in text:
        raise StaleManifestError(f"text not found: {find!r}")
    return text.replace(find, replacement)


def remove_matching_lines(text: str, pattern: str) -> str:
    regex = re.compile(pattern)
    lines = text.splitlines(keepends=True)
    kept = [line for line in lines if not regex.search(line.rstrip("\r\n"))]
    if len(kept) == len(lines):
        raise StaleManifestError(f"no line matches: {pattern!r}")
    return "".join(kept)

"""Semantic versions and version specifiers for artifact resolution.

Supported specifiers (analysis §3.3): `latest` (default), an exact `X.Y.Z`,
`^X[.Y[.Z]]` (same major; for 0.x, same minor) and `~X.Y[.Z]` (same minor).
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from functools import total_ordering

from ade_core.domain.errors import ParameterError

_VERSION = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$")
_PARTIAL = re.compile(r"^(0|[1-9]\d*)(?:\.(0|[1-9]\d*))?(?:\.(0|[1-9]\d*))?$")
LATEST = "latest"


@total_ordering
@dataclass(frozen=True)
class Version:
    major: int
    minor: int
    patch: int

    @classmethod
    def parse(cls, text: str) -> "Version":
        match = _VERSION.match(text.strip())
        if not match:
            raise ParameterError(f"'{text}' is not a semantic version (X.Y.Z)")
        return cls(*(int(part) for part in match.groups()))

    def _key(self) -> tuple[int, int, int]:
        return (self.major, self.minor, self.patch)

    def __lt__(self, other: "Version") -> bool:
        return self._key() < other._key()

    def __str__(self) -> str:
        return f"{self.major}.{self.minor}.{self.patch}"


def is_at_least(version: str, minimum: str) -> bool:
    return Version.parse(version) >= Version.parse(minimum)


def _partial(text: str, spec: str) -> tuple[int, int | None, int | None]:
    match = _PARTIAL.match(text)
    if not match:
        raise ParameterError(f"invalid version specifier '{spec}'")
    major, minor, patch = match.groups()
    return int(major), (int(minor) if minor is not None else None), (int(patch) if patch is not None else None)


def matches(version: Version, spec: str) -> bool:
    spec = spec.strip()
    if spec in ("", LATEST):
        return True
    if spec[0] in "^~":
        major, minor, patch = _partial(spec[1:], spec)
        floor = Version(major, minor or 0, patch or 0)
        if version < floor:
            return False
        if spec[0] == "~" or (major == 0 and minor is not None):
            if minor is None:
                return version.major == major
            return (version.major, version.minor) == (major, minor)
        return version.major == major
    return version == Version.parse(spec)


def select(versions: list[str], spec: str) -> str | None:
    """Highest version in `versions` that satisfies `spec`, or None."""
    candidates = [Version.parse(v) for v in versions]
    chosen = [v for v in candidates if matches(v, spec)]
    return str(max(chosen)) if chosen else None


def split_artifact_spec(text: str) -> tuple[str, str]:
    """`nestjs-rest@^0.3` -> ("nestjs-rest", "^0.3"); no `@` means latest."""
    name, _, spec = text.partition("@")
    if not name:
        raise ParameterError(f"invalid artifact reference '{text}'")
    return name.strip(), (spec.strip() or LATEST)

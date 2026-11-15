"""Remove whole Makefile targets: the rule, its recipe, its own `.PHONY` line and its trailing blank line."""

from __future__ import annotations

import re

from ade_core.domain.errors import StaleManifestError


def _rule_re(target: str) -> re.Pattern[str]:
    # `target:` or `target::` but not a `target := value` assignment
    return re.compile(rf"^{re.escape(target)}\s*::?(?!=)")


def _remove_from_phony(lines: list[str], target: str) -> list[str]:
    """Drop `target` from multi-target .PHONY declarations (including backslash continuations)."""
    out: list[str] = []
    in_phony = False
    for line in lines:
        body = line.rstrip("\n")
        starts_phony = body.startswith(".PHONY:")
        if starts_phony or in_phony:
            prefix = ".PHONY:" if starts_phony else ""
            rest = body[len(prefix) :]
            continued = rest.rstrip().endswith("\\")
            in_phony = continued
            words = rest.rstrip().rstrip("\\").split()
            if target in words:
                kept = [word for word in words if word != target]
                if not kept and not continued:
                    continue  # the line only declared this target
                leading = " " if starts_phony else rest[: len(rest) - len(rest.lstrip())]
                suffix = " \\" if continued else ""
                line = f"{prefix}{leading}{' '.join(kept)}{suffix}\n"
        out.append(line)
    return out


def remove_targets(text: str, targets: list[str]) -> str:
    lines = text.splitlines(keepends=True)
    if lines and not lines[-1].endswith("\n"):
        lines[-1] += "\n"
    for target in targets:
        rule = _rule_re(target)
        start = next((i for i, line in enumerate(lines) if rule.match(line)), None)
        if start is None:
            raise StaleManifestError(f"Makefile target not found: {target}")
        end = start + 1
        while end < len(lines) and lines[end].startswith("\t"):
            end += 1
        if end < len(lines) and lines[end].strip() == "":
            end += 1  # swallow the blank separator after the block
        del lines[start:end]
        lines = _remove_from_phony(lines, target)
    return "".join(lines)

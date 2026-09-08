from __future__ import annotations

import re
from pathlib import Path

import yaml

from knowledge.models import ConventionRecord

HEADING_RE = re.compile(r"^(#{1,3})\s+(.+?)\s*$", re.MULTILINE)
FRONTMATTER_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*\n(.*)\Z", re.DOTALL)

SOURCE_FILES = (
    "CLAUDE.md",
    "AGENTS.md",
    "docs/plans/TEMPLATE.md",
    "agents/shared/context/development-guidance.md",
    "backend/README.md",
)

RULES_GLOB = ".cursor/rules/*.mdc"

FORCE_TAGS: dict[str, tuple[str, ...]] = {
    "agents/shared/context/development-guidance.md": (
        "container-first",
        "makefile",
        "make-targets",
    ),
    "docs/plans/TEMPLATE.md": ("plan-template",),
    "CLAUDE.md": ("tech-stack",),
}

HEADING_TOPIC_TAGS: dict[str, tuple[str, ...]] = {
    "key architectural concepts": ("ddd-clean-architecture", "tech-stack"),
    "solutions": ("tech-stack",),
    "key project locations": ("tech-stack",),
    "core rule: where you build, you run": ("container-first", "makefile", "make-targets"),
    "general workflow pattern": ("container-first", "makefile", "make-targets"),
    "what never to do": ("container-first", "makefile"),
    "goal": ("plan-template",),
    "implementation steps": ("plan-template",),
    "acceptance criteria": ("plan-template",),
}


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def parse_frontmatter(text: str) -> tuple[dict, str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, text
    meta = yaml.safe_load(match.group(1)) or {}
    if not isinstance(meta, dict):
        return {}, match.group(2)
    return meta, match.group(2)


def _rel(ade_root: Path, path: Path) -> str:
    return path.resolve().relative_to(ade_root.resolve()).as_posix()


def _tags_for(topic: str, heading: str, extra: tuple[str, ...] = ()) -> list[str]:
    tags = {topic, *extra}
    heading_key = heading.lower().strip()
    for needle, forced in HEADING_TOPIC_TAGS.items():
        if needle in heading_key:
            tags.update(forced)
    return sorted(tags)


def parse_markdown_sections(
    ade_root: Path,
    path: Path,
    text: str,
    default_topic: str,
    extra_tags: tuple[str, ...] = (),
) -> list[ConventionRecord]:
    source_path = _rel(ade_root, path)
    matches = list(HEADING_RE.finditer(text))
    if not matches:
        content = text.strip()
        if not content:
            return []
        return [
            ConventionRecord(
                topic=default_topic,
                scope_glob=source_path,
                source_path=source_path,
                content=content,
                tags=_tags_for(default_topic, default_topic, extra_tags),
            )
        ]

    records: list[ConventionRecord] = []
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        heading = match.group(2).strip()
        body = text[start:end].strip()
        if not body:
            continue
        topic = _slug(heading) or default_topic
        records.append(
            ConventionRecord(
                topic=topic,
                scope_glob=source_path,
                source_path=source_path,
                content=f"{heading}\n\n{body}",
                tags=_tags_for(topic, heading, extra_tags + (default_topic,)),
            )
        )
    return records


def parse_mdc(ade_root: Path, path: Path, text: str) -> list[ConventionRecord]:
    meta, body = parse_frontmatter(text)
    topic = path.stem
    globs = meta.get("globs") or []
    if isinstance(globs, str):
        scope = globs
    elif isinstance(globs, list):
        scope = ",".join(str(item) for item in globs)
    else:
        scope = "**"
    extra = (topic,)
    if topic in {"000-core", "backend", "conference-manager"}:
        extra = extra + ("ddd-clean-architecture",)
    return parse_markdown_sections(ade_root, path, body, topic, extra) or [
        ConventionRecord(
            topic=topic,
            scope_glob=scope or _rel(ade_root, path),
            source_path=_rel(ade_root, path),
            content=body.strip() or text.strip(),
            tags=_tags_for(topic, topic, extra),
        )
    ]


def ingest(ade_root: Path) -> list[ConventionRecord]:
    root = ade_root.resolve()
    records: list[ConventionRecord] = []

    for relative in SOURCE_FILES:
        path = root / relative
        if not path.is_file():
            continue
        extra = FORCE_TAGS.get(relative, ())
        default_topic = _slug(path.stem)
        records.extend(parse_markdown_sections(root, path, path.read_text(encoding="utf-8"), default_topic, extra))

    for path in sorted((root / ".cursor" / "rules").glob("*.mdc")):
        records.extend(parse_mdc(root, path, path.read_text(encoding="utf-8")))

    return records

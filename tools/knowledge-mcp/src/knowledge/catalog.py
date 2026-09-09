from __future__ import annotations

from knowledge.store import KnowledgeStore

TOPIC_ALIASES = {
    "make-targets": "makefile",
    "make": "makefile",
    "unified-cli-facade": "makefile",
    "cli-facade": "makefile",
    "container": "container-first",
    "terraform": "iac",
    "infrastructure": "iac",
    "ddd": "ddd-clean-architecture",
    "clean-architecture": "ddd-clean-architecture",
    "architecture": "ddd-clean-architecture",
    "plan": "plan-template",
    "stack": "tech-stack",
}

STATIC_RESOURCES = (
    ("conventions://tech-stack", "tech-stack"),
    ("conventions://ddd-clean-architecture", "ddd-clean-architecture"),
    ("conventions://plan-template", "plan-template"),
    ("conventions://container-first", "container-first"),
)

COMPONENT_RULE_STEMS = (
    "backend",
    "cli",
    "cloud",
    "devops",
    "mobile-app",
    "conference-manager",
    "knowledge-mcp",
)


def canonicalize_topic(topic: str) -> str:
    normalized = topic.strip().lower().replace("_", "-")
    return TOPIC_ALIASES.get(normalized, normalized)


def get_convention(store: KnowledgeStore, topic: str) -> dict:
    canonical = canonicalize_topic(topic)
    excerpts = [
        {
            "source_path": record.source_path,
            "content": record.content,
            "topic": record.topic,
        }
        for record in store.find(canonical)
    ]
    return {"topic": canonical, "excerpts": excerpts}


def read_resource(store: KnowledgeStore, uri: str) -> str:
    prefix = "conventions://component/"
    if uri.startswith(prefix):
        name = uri[len(prefix) :]
        payload = get_convention(store, name)
    else:
        topic = uri.split("://", 1)[-1]
        payload = get_convention(store, topic)
    if not payload["excerpts"]:
        return f"No convention records found for {uri}."
    blocks = [f"# {item['source_path']}\n\n{item['content']}" for item in payload["excerpts"]]
    return "\n\n---\n\n".join(blocks)


def list_resource_uris(store: KnowledgeStore) -> list[str]:
    uris = [uri for uri, _topic in STATIC_RESOURCES]
    for stem in COMPONENT_RULE_STEMS:
        if store.find(stem):
            uris.append(f"conventions://component/{stem}")
    return uris

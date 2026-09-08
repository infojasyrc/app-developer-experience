from dataclasses import asdict, dataclass, field


@dataclass
class ConventionRecord:
    topic: str
    scope_glob: str
    source_path: str
    content: str
    tags: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "ConventionRecord":
        return cls(
            topic=data["topic"],
            scope_glob=data.get("scope_glob", ""),
            source_path=data["source_path"],
            content=data["content"],
            tags=list(data.get("tags") or []),
        )

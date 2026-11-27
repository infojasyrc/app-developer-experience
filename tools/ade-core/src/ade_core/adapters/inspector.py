"""ProjectInspector: read the target repository to fill parameter defaults (analysis §4.4, Phase 2 subset).

Signals:
- `nx.json` -> monorepo layout: the service goes to `backend/<name>`;
  otherwise standalone: `./<name>`.
- Target `.env` / `.env.public` -> PLATFORM, CONTAINER_RUNTIME, PROJECT_NAME.
- `HTTP_PORT` in sibling services' `.env.public` -> a free `http_port`.

The inspector only suggests values. The caller's explicit values always win.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

_ENV_LINE = re.compile(r"^([A-Z_][A-Z0-9_]*)=(.*)$")
_ENV_TO_PARAM = {"PLATFORM": "platform", "CONTAINER_RUNTIME": "container_runtime", "PROJECT_NAME": "project_name"}
SERVICE_ROOTS = ("backend",)


@dataclass
class ProjectContext:
    root: Path
    layout: str  # "monorepo" | "standalone"
    detected: dict[str, str] = field(default_factory=dict)  # parameter -> value from the repo
    used_ports: dict[int, str] = field(default_factory=dict)  # port -> relative service path

    def default_output_dir(self, name: str) -> str:
        return f"backend/{name}" if self.layout == "monorepo" else name

    def free_port(self, wanted: int) -> int:
        port = wanted
        while port in self.used_ports:
            port += 1
        return port


def read_dotenv(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.is_file():
        return values
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        match = _ENV_LINE.match(line.strip())
        if match:
            values[match.group(1)] = match.group(2).strip().strip('"').strip("'")
    return values


def inspect_project(root: Path) -> ProjectContext:
    root = Path(root)
    layout = "monorepo" if (root / "nx.json").is_file() else "standalone"
    env = {**read_dotenv(root / ".env.public"), **read_dotenv(root / ".env")}
    detected = {param: env[key] for key, param in _ENV_TO_PARAM.items() if env.get(key)}

    used_ports: dict[int, str] = {}
    for service_root in SERVICE_ROOTS:
        for env_file in sorted((root / service_root).glob("*/.env.public")):
            value = read_dotenv(env_file).get("HTTP_PORT", "")
            if value.isdigit():
                used_ports.setdefault(int(value), env_file.parent.relative_to(root).as_posix())
    return ProjectContext(root=root, layout=layout, detected=detected, used_ports=used_ports)

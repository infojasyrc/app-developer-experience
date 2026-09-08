from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from core.constants import Environment


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", populate_by_name=True)

    debug: bool = True
    APP_NAME: str = "knowledge-mcp"
    APP_VERSION: str = "0.1.0"
    environment: Environment = Environment.DEVELOPMENT
    HOST: str = "0.0.0.0"
    api_port: int = 8000
    ade_root: Path | None = Field(default=None, alias="ADE_ROOT")
    index_path: Path = Field(default=Path("dist/knowledge.json"), alias="INDEX_PATH")

    @property
    def fastapi_kwargs(self) -> dict:
        return {
            "debug": self.debug,
            "title": self.APP_NAME,
            "version": self.APP_VERSION,
        }

    def resolve_ade_root(self) -> Path:
        if self.ade_root:
            root = self.ade_root.resolve()
            if (root / "CLAUDE.md").exists():
                return root
            raise FileNotFoundError(f"ADE_ROOT={root} does not contain CLAUDE.md")
        here = Path(__file__).resolve()
        for parent in here.parents:
            if (parent / "CLAUDE.md").exists() and (parent / "AGENTS.md").exists():
                return parent
        raise FileNotFoundError("Could not locate ADE root (CLAUDE.md + AGENTS.md). Set ADE_ROOT.")


@lru_cache
def get_settings() -> Settings:
    return Settings()

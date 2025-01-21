import datetime
from beanie import Document
from pydantic import Field
from typing import Optional


class Headquarter(Document):
    name: str = Field(...)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    deleted_at: Optional[datetime.datetime] = Field(None)

    class Settings:
        collection = "headquarters"
        indexes = ["name"]


import datetime
from typing import Optional
from beanie import Document


class Headquarter(Document):
    """"
    Headquarter entity
    """
    name: str
    created_at: datetime.datetime = datetime.datetime.utcnow
    updated_at: datetime.datetime = datetime.datetime.utcnow
    deleted_at: Optional[datetime.datetime] = datetime.datetime.utcnow

    class Settings:
        collection = "headquarters"
        indexes = ["name"]

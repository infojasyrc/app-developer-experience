from pydantic import BaseModel


class HeadquarterEntity(BaseModel):
    name: str
    email: str

from beanie import Document


class Admin(Document):
    username: str
    password: str

    class Settings:
        name = "admins"
        collection = "admins"

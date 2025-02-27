from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from core.environment import get_database_url, get_environ_variables
from models import Headquarter, Admin


async def connect_to_db():
    """
    Connect to the database
    """
    environ_variables = get_environ_variables()
    client = AsyncIOMotorClient(get_database_url())
    await init_beanie(
        database=client[environ_variables['default_db']],
        document_models=[Headquarter, Admin]
    )

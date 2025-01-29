from motor.motor_asyncio import AsyncIOMotorClient

from core.environment import get_database_url


async def run_migration():
    """
    Initialize the database
    """
    client = AsyncIOMotorClient(get_database_url())
    db = client.my_database

    await db.headquarters.create_index("name", unique=True)


async def main():
    await init_db()


asyncio.run(main())

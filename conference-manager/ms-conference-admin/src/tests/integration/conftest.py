import asyncio
import pytest
import pytest_asyncio
from fastapi import Request
from httpx import AsyncClient

from core.settings import Settings, get_settings
from application import get_core_app


@pytest_asyncio.fixture()
async def async_client() -> AsyncClient:
    app = get_core_app()
    async with AsyncClient(base_url="http://ms-conference-admin:3000", follow_redirects=True) as client:
        # Run startup events before tests
        for handler in app.router.on_startup:
            await handler()

        yield client

        # Run shutdown events after tests
        for handler in app.router.on_shutdown:
            await handler()


@pytest_asyncio.fixture()
async def settings() -> Settings:
    yield get_settings()

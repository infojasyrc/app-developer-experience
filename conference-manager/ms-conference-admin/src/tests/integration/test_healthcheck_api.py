import pytest
from starlette import status
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_healthcheck_success_response(
    async_client: AsyncClient,
):
    response = await async_client.get(
        "/healthcheck/",
        headers={},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"status": "ok"}

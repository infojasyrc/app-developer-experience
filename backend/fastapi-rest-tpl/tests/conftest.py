import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def test_client() -> TestClient:
    """
    Create a test client for the FastAPI application.
    This client can be used to make requests to the application during tests.
    """
    return TestClient(app)

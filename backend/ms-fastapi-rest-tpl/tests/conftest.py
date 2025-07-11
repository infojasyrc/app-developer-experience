import pytest
from fastapi.testclient import TestClient

from src.application import get_application


def get_test_client() -> TestClient:
    """
    Create a test client for the FastAPI application.
    This client can be used to make requests to the application during tests.
    """
    app = get_application()
    return TestClient(app)

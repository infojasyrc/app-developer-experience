import pytest
import os
import sys

src_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src'))
sys.path.insert(0, src_path)


from fastapi.testclient import TestClient

from src.application import get_application


@pytest.fixture
def test_client() -> TestClient:
    """
    Create a test client for the FastAPI application.
    This client can be used to make requests to the application during tests.
    """
    app = get_application()
    return TestClient(app)

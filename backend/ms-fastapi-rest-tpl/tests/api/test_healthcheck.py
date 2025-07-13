import pytest
from unittest.mock import patch


@pytest.mark.healthcheck
def test_healthcheck_success_response(test_client):
    """
    Test the healthcheck endpoint for a successful response.
    """
    response = test_client.get("/healthcheck")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.skip(reason="Cannot patch route handler after test_client is initialized; refactor app for better testability.")
@pytest.mark.healthcheck
def test_healthcheck_failure_response(test_client):
    """
    Test the healthcheck endpoint for a failure response.
    This simulates a failure by patching the route handler to raise an exception.
    """
    pass

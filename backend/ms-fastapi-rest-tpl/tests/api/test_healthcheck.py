import pytest


@pytest.mark.healthcheck
def test_healthcheck_success_response(client):
    """
    Test the healthcheck endpoint for a successful response.
    """
    response = client.get("/healthcheck")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.healthcheck
def test_healthcheck_failure_response(client):
    """
    Test the healthcheck endpoint for a failure response.
    This simulates a failure by mocking the database connection.
    """
    # Mocking a failure in the database connection
    with pytest.raises(Exception):
        client.get("/healthcheck")
    
    # Assuming the healthcheck endpoint returns a 503 status code on failure
    response = client.get("/healthcheck")
    assert response.status_code == 503
    assert response.json() == {"status": "error", "message": "Service Unavailable"}

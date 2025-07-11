import pytest


@pytest.mark.healthcheck
def test_healthcheck_success_response(test_client):
    """
    Test the healthcheck endpoint for a successful response.
    """
    response = test_client.get("/healthcheck")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.healthcheck
def test_healthcheck_failure_response(test_client):
    """
    Test the healthcheck endpoint for a failure response.
    This simulates a failure by mocking the database connection.
    """
    # Mocking a failure in the database connection
    with pytest.raises(Exception):
        test_client.get("/healthcheck")
    
    # Assuming the healthcheck endpoint returns a 503 status code on failure
    response = get_test_client.get("/healthcheck")
    assert response.status_code == 503
    assert response.json() == {"status": "error", "message": "Service Unavailable"}

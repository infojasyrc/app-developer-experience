def test_healthcheck_success_response(test_client):
    response = test_client.get("/healthcheck/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

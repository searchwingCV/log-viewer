def test_app_status(test_client):
    response = test_client.post("/status")
    assert response.status_code == 200

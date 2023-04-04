def test_app_health(test_client):
    response = test_client.get("/health")
    assert response.content == b'{"apiHealthy":true,"dbHealthy":true,"overallHealthy":true}'
    assert response.status_code == 200

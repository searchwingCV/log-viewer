import pytest
from infrastructure.dependencies import get_db


@pytest.fixture
def mock_get_db(mock_session_factory):
    with mock_session_factory as session:
        yield session


def test_app_health(test_client, mock_get_db):
    test_client.app.dependency_overrides[get_db] = lambda: mock_get_db

    response = test_client.get("/health")

    assert response.content == b'{"apiHealthy":true,"dbHealthy":true,"overallHealthy":true}'
    assert response.status_code == 200
    test_client.app.dependency_overrides.clear()

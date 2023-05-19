import json

from common.exceptions.db import ForeignKeyNotFound
from presentation.rest.dependencies import get_flight_service


def test_patch_flight_batch_error(test_client, mock_flight_service):
    mock_flight_service.update.side_effect = [
        ForeignKeyNotFound("flight", {"somekey": "somedata"}, "ERROR, fk not found")
    ]

    test_client.app.dependency_overrides[get_flight_service] = lambda: mock_flight_service
    body = """
    {
        "items": [
            {
                "id": 1,
                "fkDrone": 10
            }
        ]
    }
    """

    expected = """
    {
        "success": false,
        "items": [],
        "errors": [
            {
                "id": 1,
                "title": "Unprocessable entity error",
                "code": "invalid-payload",
                "detail": "one or more references do not exist: {'fk_drone': 10, 'fk_mission': None}"
            }
        ]
    }
    """
    response = test_client.patch("/flight", data=body)

    assert response.status_code == 200
    assert response.json() == json.loads(expected)

    test_client.app.dependency_overrides.clear()

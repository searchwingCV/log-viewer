import json
from datetime import datetime

from common.exceptions.db import ForeignKeyNotFound
from domain.flight.entities import Flight
from domain.flight_file.entities import FlightFile
from domain.flight_file.value_objects import AllowedFiles
from presentation.rest.dependencies import get_file_service, get_flight_service


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


def test_get_all_flights_with_files(
    test_client, mock_flight_service, mock_file_service, get_sample_flight, get_sample_flight_file
):
    flight_1 = Flight(id=1, created_at=datetime.now(), **get_sample_flight().dict())
    flight_2 = Flight(id=2, created_at=datetime.now(), **get_sample_flight().dict())

    mock_flight_service.get_all_with_pagination.return_value = (2, [flight_1, flight_2])

    file_1 = FlightFile(id=1, created_at=datetime.now(), **get_sample_flight_file(file_type=AllowedFiles.log).dict())
    file_2 = FlightFile(id=2, created_at=datetime.now(), **get_sample_flight_file(file_type=AllowedFiles.apm).dict())

    mock_file_service.list_all_files.return_value = [file_1, file_2]

    test_client.app.dependency_overrides[get_flight_service] = lambda: mock_flight_service
    test_client.app.dependency_overrides[get_file_service] = lambda: mock_file_service

    response = test_client.get("/flight")

    assert response.status_code == 200

    assert response.json().get("total") == 2

    items = response.json().get("items")

    assert items[0].get("files").get("log").get("count") == 1
    assert items[0].get("files").get("log").get("data")[0].get("id") == 1
    assert items[0].get("files").get("log").get("data")[0].get("downloadLink") == "/file/1"

    assert items[0].get("files").get("apm").get("count") == 1
    assert items[0].get("files").get("apm").get("data")[0].get("id") == 2
    assert items[0].get("files").get("apm").get("data")[0].get("downloadLink") == "/file/2"

    test_client.app.dependency_overrides.clear()

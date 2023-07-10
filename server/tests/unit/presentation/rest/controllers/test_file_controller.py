from datetime import datetime

from common.exceptions.db import NotFoundException
from domain.flight_file.entities import FlightFile
from domain.flight_file.value_objects import AllowedFiles
from presentation.rest.dependencies import get_file_service
from presentation.rest.serializers.file import FlightFileSerializer


def test_put_file_no_error(test_client, mock_file_service, get_sample_flight_file):
    flight_file = FlightFile(id=1, created_at=datetime.now(), **get_sample_flight_file().dict())

    mock_file_service.upload_file.return_value = flight_file
    test_client.app.dependency_overrides[get_file_service] = lambda: mock_file_service

    test_file = b"foo"
    file_type = "log"
    response = test_client.put(
        "/flight/1/file?file_type=log&process=false",
        files={"file": ("test.bin", test_file, "application/octet-stream")},
        params={"file_type": file_type},
    )

    assert response.status_code == 200
    assert response.json() == FlightFileSerializer.from_orm(flight_file).to_json()

    test_client.app.dependency_overrides.clear()


def test_put_file_not_found(test_client, mock_file_service, get_sample_flight_file):
    mock_file_service.upload_file.side_effect = [NotFoundException(1, "FlightFile")]
    test_client.app.dependency_overrides[get_file_service] = lambda: mock_file_service

    test_file = b"foo"
    file_type = "log"
    response = test_client.put(
        "/flight/1/file?file_type=log&process=false",
        files={"file": ("test.bin", test_file, "application/octet-stream")},
        params={"file_type": file_type},
    )
    assert response.status_code == 400

    test_client.app.dependency_overrides.clear()


def test_list_files(test_client, mock_file_service, get_sample_flight_file):
    flight_file_1 = FlightFile(
        id=1, created_at=datetime.now(), **get_sample_flight_file(file_type=AllowedFiles.log).dict()
    )
    flight_file_2 = FlightFile(
        id=2, created_at=datetime.now(), **get_sample_flight_file(file_type=AllowedFiles.rosbag).dict()
    )
    mock_file_service.list_all_files.return_value = [flight_file_1, flight_file_2]

    test_client.app.dependency_overrides[get_file_service] = lambda: mock_file_service
    response = test_client.get("flight/1/file")
    data = response.json()

    assert response.status_code == 200

    assert data["log"]["count"] == 1
    assert data["log"]["data"][0]["id"] == 1
    assert data["log"]["data"][0]["downloadLink"] == "http://testserver/file/1"

    assert data["rosbag"]["count"] == 1
    assert data["rosbag"]["data"][0]["id"] == 2
    assert data["rosbag"]["data"][0]["downloadLink"] == "http://testserver/file/2"

    assert data["apm"]["count"] == 0
    assert data["tlog"]["count"] == 0

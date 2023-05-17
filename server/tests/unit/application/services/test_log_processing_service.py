from datetime import datetime, timedelta
from io import BytesIO
from unittest.mock import Mock

import pytest
from application.services import LogProcessingService, log_processing
from domain.flight.entities import FlightComputedUpdate
from domain.flight_file.entities import AllowedFiles, FlightFile, IOFile
from pymavlog import MavLog


@pytest.fixture
def mock_mavlog():
    mock_mavlog = Mock(spec=MavLog)
    return mock_mavlog


@pytest.fixture
def get_log_processing_service(monkeypatch, mock_mavlog, mock_file_service, mock_flight_service):
    def wrapper(mavlog=mock_mavlog, file_service=mock_file_service) -> LogProcessingService:
        monkeypatch.setattr(log_processing, "MavLog", mavlog)
        lps = LogProcessingService(file_service=file_service, flight_service=mock_flight_service)
        return lps

    return wrapper


def test_process_flight_duration_from_log(get_log_processing_service, mock_mavlog, mock_file_service):
    mock_file_service.get_by_flight_id_type.return_value = IOFile(
        flight_file=FlightFile(
            fk_flight=1, file_type=AllowedFiles.log, location="foo/bar/file.bin", id=1, created_at=datetime.now()
        ),
        io=BytesIO(b"foobar"),
    )

    expected_start_time = datetime(year=2023, month=1, day=1, hour=0, minute=0, second=0)
    expected_end_time = datetime(year=2023, month=1, day=1, hour=1, minute=0, second=0)

    mock_mavlog().start_timestamp = expected_start_time
    mock_mavlog().end_timestamp = expected_end_time
    log_processing_service: LogProcessingService = get_log_processing_service(mavlog=mock_mavlog)

    output = log_processing_service.process_flight_duration(flight_id=1)

    expected = FlightComputedUpdate(
        id=1, log_start_time=expected_start_time, log_end_time=expected_end_time, log_duration=timedelta(hours=1)
    ).json(exclude_none=True)

    assert output == expected

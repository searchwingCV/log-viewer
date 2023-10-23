from datetime import datetime, timedelta
from io import BytesIO
from unittest.mock import Mock

import pytest
from application.services import LogProcessingService, log_processing
from domain.flight.entities import FlightComputedUpdate
from domain.flight_file.entities import AllowedFiles, FlightFile, IOFile
from domain.mavlink_timeseries.entities import MavLinkFlightMessageProperties, MavLinkMessageProperties
from pymavlog import MavLog


@pytest.fixture
def mock_mavlog():
    mock_mavlog = Mock(spec=MavLog)
    return mock_mavlog


@pytest.fixture
def mock_mavlink_series_repository():
    mock_mavlink_series_repository = Mock()
    return mock_mavlink_series_repository


@pytest.fixture
def get_log_processing_service(
    monkeypatch,
    mock_mavlog,
    mock_file_service,
    mock_flight_service,
    mock_mavlink_series_repository,
    mock_session_factory,
):
    def wrapper(
        mavlog=mock_mavlog,
        file_service=mock_file_service,
        mavlink_timeseries_repository=mock_mavlink_series_repository,
        flight_service=mock_flight_service,
    ) -> LogProcessingService:
        monkeypatch.setattr(log_processing, "MavLog", mavlog)
        lps = LogProcessingService(
            file_service=file_service,
            flight_service=flight_service,
            mavlink_timeseries_repository=mavlink_timeseries_repository,
            session=mock_session_factory,
        )
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


def test_save_timeseries(
    get_log_processing_service, mock_mavlog, mock_file_service, mavlink_series, mock_mavlink_series_repository
):
    mock_file_service.get_by_flight_id_type.return_value = IOFile(
        flight_file=FlightFile(
            fk_flight=1, file_type=AllowedFiles.log, location="foo/bar/file.bin", id=1, created_at=datetime.now()
        ),
        io=BytesIO(b"foobar"),
    )
    mock_mavlog().types = ["FOO", "BAR"]
    series = Mock()
    series.side_effect = [mavlink_series, mavlink_series]
    mock_mavlog().__getitem__ = series

    lps = get_log_processing_service(
        mavlog=mock_mavlog, file_service=mock_file_service, mavlink_timeseries_repository=mock_mavlink_series_repository
    )

    result = lps.save_timeseries(flight_id=1)

    mock_mavlink_series_repository.delete_by_flight_id.assert_called_once()

    assert mock_mavlink_series_repository.bulk_insert.call_count == 2
    assert result == {"success": True, "errors": []}


def test_save_timeseries_error(
    get_log_processing_service,
    mock_mavlog,
    mock_file_service,
    mavlink_series,
    mock_mavlink_series_repository,
    mock_session,
):
    mock_file_service.get_by_flight_id_type.return_value = IOFile(
        flight_file=FlightFile(
            fk_flight=1, file_type=AllowedFiles.log, location="foo/bar/file.bin", id=1, created_at=datetime.now()
        ),
        io=BytesIO(b"foobar"),
    )
    mock_mavlog().types = [
        "FOO",
        "BAR",
    ]

    series = Mock()
    series.side_effect = [mavlink_series, Exception("foo")]
    mock_mavlog().__getitem__ = series

    lps = get_log_processing_service(
        mavlog=mock_mavlog, file_service=mock_file_service, mavlink_timeseries_repository=mock_mavlink_series_repository
    )

    result = lps.save_timeseries(flight_id=1)

    mock_mavlink_series_repository.delete_by_flight_id.assert_called_once()

    assert mock_mavlink_series_repository.bulk_insert.call_count == 1

    assert result == {"success": False, "errors": [{"message_type": "BAR", "error": "foo"}]}


def test_get_message_properties(
    get_log_processing_service,
    mock_flight_service,
    mock_mavlog,
    mock_file_service,
    mock_mavlink_series_repository,
    get_sample_flight,
):
    test_flight = get_sample_flight()
    mock_flight_service.get_by_id.return_value = test_flight
    mock_mavlink_series_repository.get_available_messages_by_group.return_value = MavLinkFlightMessageProperties(
        flight_id=1,
        message_properties=[
            MavLinkMessageProperties(
                **{
                    "message_type": "FOO",
                    "message_fields": [
                        {"name": "BAR", "unit": "BAR_UNIT"},
                    ],
                }
            ),
        ],
    )
    expected = MavLinkFlightMessageProperties(
        flight_id=1,
        message_properties=[
            MavLinkMessageProperties(
                **{
                    "message_type": "FOO",
                    "message_fields": [
                        {"name": "BAR", "unit": "BAR_UNIT"},
                    ],
                }
            ),
        ],
        start_timestamp=test_flight.log_start_time,
        end_timestamp=test_flight.log_end_time,
    )
    lps = get_log_processing_service(
        mavlog=mock_mavlog,
        file_service=mock_file_service,
        mavlink_timeseries_repository=mock_mavlink_series_repository,
        flight_service=mock_flight_service,
    )
    result = lps.get_message_properties(flight_id=1)

    assert result == expected


def test_get_timeseries(get_log_processing_service, mock_mavlog, mock_file_service, mock_mavlink_series_repository):
    mock_mavlink_series_repository.get_by_flight_type_field.return_value = {"foo": 1, "bar": 2}

    lps: LogProcessingService = get_log_processing_service(
        mavlog=mock_mavlog, file_service=mock_file_service, mavlink_timeseries_repository=mock_mavlink_series_repository
    )
    result = lps.get_timeseries(flight_id=1, message_type="foo", message_field="bar")

    assert result == {"foo": 1, "bar": 2}

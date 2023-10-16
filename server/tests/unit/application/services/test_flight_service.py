from unittest.mock import Mock, call

from application.services.flight import FlightService
from domain.flight_file.entities import FlightFile
from infrastructure.repositories import (
    DroneRepository,
    FlightFileRepository,
    FlightRepository,
    MavLinkTimeseriesRepository,
    MissionRepository,
)
from infrastructure.storage import Storage


def test_save(mock_session_factory):
    mock_flight_repository = Mock(spec=FlightRepository)
    mock_drone_repository = Mock(spec=DroneRepository)
    mock_mission_repository = Mock(spec=MissionRepository)
    mock_mavlink_timeseries_repository = Mock(spec=MavLinkTimeseriesRepository)

    service = FlightService(
        repository=mock_flight_repository,
        session=mock_session_factory,
        mission_repository=mock_mission_repository,
        mavlink_timeseries_repository=mock_mavlink_timeseries_repository,
        drone_repository=mock_drone_repository,
        file_repository=Mock(),
        storage=Mock(),
    )

    service.get_flight_mavlink_message_props(1)

    mock_mavlink_timeseries_repository.get_available_messages_by_group.assert_called_once()


def test_delete_by_id(mock_session_factory):
    mock_flight_repository = Mock(spec=FlightRepository)
    mock_drone_repository = Mock(spec=DroneRepository)
    mock_mission_repository = Mock(spec=MissionRepository)
    mock_mavlink_timeseries_repository = Mock(spec=MavLinkTimeseriesRepository)
    mock_file_repository = Mock(spec=FlightFileRepository)
    mock_storage = Mock(spec=Storage)

    file_1 = Mock(spec=FlightFile)
    file_1.location = "1/log/foo.log"

    file_2 = Mock(spec=FlightFile)
    file_2.location = "1/log/bar.log"

    mock_file_repository.get_by_flight.return_value = [
        file_1,
        file_2,
    ]

    service = FlightService(
        repository=mock_flight_repository,
        session=mock_session_factory,
        mission_repository=mock_mission_repository,
        mavlink_timeseries_repository=mock_mavlink_timeseries_repository,
        drone_repository=mock_drone_repository,
        file_repository=mock_file_repository,
        storage=mock_storage,
    )

    service.delete_by_id(1)

    mock_mavlink_timeseries_repository.delete_by_flight_id.assert_called_once_with(mock_session_factory.__enter__(), 1)
    mock_flight_repository.delete_by_id.assert_called_once_with(mock_session_factory.__enter__(), 1)
    mock_file_repository.delete_by_flight_id.assert_called_once_with(mock_session_factory.__enter__(), 1)
    mock_storage.delete.assert_has_calls([call(file_1.location), call(file_2.location)])

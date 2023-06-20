from unittest.mock import Mock

from application.services.flight import FlightService
from infrastructure.repositories import (
    DroneRepository,
    FlightRepository,
    MavLinkTimeseriesRepository,
    MissionRepository,
)


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
    )

    service.get_flight_mavlink_message_props(1)

    mock_mavlink_timeseries_repository.get_available_messages_by_group.assert_called_once()

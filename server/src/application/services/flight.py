from application.services.base import BaseCRUDService
from common.exceptions.db import NotFoundException
from domain.flight.entities import BaseFlight, Flight
from domain.mavlink_timeseries.entities import MavLinkFlightMessageProperties
from domain.types import ID_Type
from infrastructure.db.session import SessionContextManager
from infrastructure.repositories import (
    DroneRepository,
    FlightRepository,
    MavLinkTimeseriesRepository,
    MissionRepository,
)


class FlightService(BaseCRUDService):
    _entity = Flight
    _entity_type = "flight"

    def __init__(
        self,
        repository: FlightRepository,
        mission_repository: MissionRepository,
        drone_repository: DroneRepository,
        mavlink_timeseries_repository: MavLinkTimeseriesRepository,
        session: SessionContextManager = SessionContextManager(),
    ):
        self._mission_repository = mission_repository
        self._drone_repository = drone_repository
        self._mavlink_timeseries_repository = mavlink_timeseries_repository
        super().__init__(repository, session)

    def create(self, data: BaseFlight) -> Flight:
        with self._session as session:
            if data.fk_mission is not None:
                if not self._mission_repository.get_by_id(session, data.fk_mission):
                    raise NotFoundException(data.fk_mission, "mission")

            if not self._drone_repository.get_by_id(session, data.fk_drone):
                raise NotFoundException(data.fk_mission, "drone")

        return self.upsert(data)

    def get_flight_mavlink_message_props(self, flight_id: ID_Type) -> MavLinkFlightMessageProperties:
        with self._session as session:
            message_props = self._mavlink_timeseries_repository.get_available_messages_by_group(session, flight_id)
        return message_props

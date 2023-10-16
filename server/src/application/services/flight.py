from application.services.base import BaseCRUDService
from common.exceptions.db import NotFoundException
from common.logging import get_logger
from domain.flight.entities import BaseFlight, Flight
from domain.flight_file.entities import FlightFile  # noqa F401
from domain.mavlink_timeseries.entities import MavLinkFlightMessageProperties
from domain.types import ID_Type
from infrastructure.db.session import SessionContextManager
from infrastructure.repositories import (
    DroneRepository,
    FlightFileRepository,
    FlightRepository,
    MavLinkTimeseriesRepository,
    MissionRepository,
)
from infrastructure.storage import Storage

logger = get_logger(__name__)


class FlightService(BaseCRUDService):
    _entity = Flight
    _entity_type = "flight"

    def __init__(
        self,
        repository: FlightRepository,
        mission_repository: MissionRepository,
        drone_repository: DroneRepository,
        file_repository: FlightFileRepository,
        storage: Storage,
        mavlink_timeseries_repository: MavLinkTimeseriesRepository,
        session: SessionContextManager = SessionContextManager(),
    ):
        self._mission_repository = mission_repository
        self._drone_repository = drone_repository
        self._mavlink_timeseries_repository = mavlink_timeseries_repository
        self._file_repository = file_repository
        self._storage = storage
        self._logger = logger
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

    def delete_by_id(self, id: ID_Type) -> None:
        with self._session as session:
            self._mavlink_timeseries_repository.delete_by_flight_id(session, id)
            flight_files = self._file_repository.get_by_flight(session=session, fk_flight=id)  # type: list[FlightFile]
            logger.info(f"deleting {len(flight_files)} files from flight {id=}")
            for flight_file in flight_files:
                self._storage.delete(flight_file.location)
            self._file_repository.delete_by_flight_id(session, id)
            self._repository.delete_by_id(session, id)

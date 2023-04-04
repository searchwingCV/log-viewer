from application.services.base import BaseCRUDService
from common.exceptions.db import NotFoundException
from domain.flight.entities import BaseFlight, Flight
from infrastructure.db.session import SessionContextManager
from infrastructure.repositories import DroneRepository, FlightRepository, MissionRepository


class FlightService(BaseCRUDService):
    _entity = Flight
    _entity_type = "flight"

    def __init__(
        self,
        repository: FlightRepository,
        mission_repository: MissionRepository,
        drone_repository: DroneRepository,
        session: SessionContextManager = SessionContextManager(),
    ):
        self._mission_repository = mission_repository
        self._drone_repository = drone_repository
        super().__init__(repository, session)

    def create(self, data: BaseFlight) -> Flight:
        with self._session as session:
            if data.fk_mission is not None:
                if not self._mission_repository.get_by_id(session, data.fk_mission):
                    raise NotFoundException(data.fk_mission, "mission")

            if not self._drone_repository.get_by_id(session, data.fk_drone):
                raise NotFoundException(data.fk_mission, "drone")

        return self.upsert(data)

from typing import Union

from domain.drone.entities import Drone
from infrastructure.db.orm import Drone as DroneModel
from infrastructure.repositories.base import BaseRepository
from sqlalchemy.orm import Session


class DroneRepository(BaseRepository):
    _model = DroneModel
    _entity = Drone

    def get_by_name(self, session: Session, name: str) -> Union[Drone, None]:
        return self._get_by_filters(session, {"name": name}, "first")

from typing import Union

from domain.mission.entities import Mission
from infrastructure.db.orm import Mission as MissionModel
from infrastructure.repositories.base import BaseRepository
from sqlalchemy.orm import Session


class MissionRepository(BaseRepository):
    _model = MissionModel
    _entity = Mission

    def get_by_name(self, session: Session, name: str) -> Union[Mission, None]:
        return self._get_by_filters(session, {"name": name}, "first")

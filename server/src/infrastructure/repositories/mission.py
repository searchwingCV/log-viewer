from typing import Union

from domain.mission.entities import Mission
from infrastructure.db.orm import Mission as MissionModel
from infrastructure.repositories.base import BaseRepository
from sqlalchemy.orm import Session


class MissionRepository(BaseRepository):
    _model = MissionModel
    _entity = Mission

    def get_by_alias(self, session: Session, alias: str) -> Union[Mission, None]:
        return self._get_by_filters(session, {"alias": alias}, "first")

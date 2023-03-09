from typing import Union

from domain.plane.entities import Plane
from infrastructure.db.orm import Plane as PlaneModel
from infrastructure.repositories.base import BaseRepository
from sqlalchemy.orm import Session


class PlaneRepository(BaseRepository):
    _model = PlaneModel
    _entity = Plane

    def get_by_alias(self, session: Session, alias: str) -> Union[Plane, None]:
        return self._get_by_filters(session, {"alias": alias}, "first")

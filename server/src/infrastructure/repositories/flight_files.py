from typing import List

from domain.flight_file.entities import FlightFile, ID_Type
from infrastructure.db.orm import FlightFiles as FlightFilesModel
from infrastructure.repositories.base import BaseRepository
from sqlalchemy.orm import Session


class FlightFileRepository(BaseRepository):
    _model = FlightFilesModel
    _entity = FlightFile

    def get_by_flight(self, fk_flight: ID_Type, session: Session) -> List[FlightFile]:
        data = self._get_by_filters(session, {"fk_flight": fk_flight})
        return data

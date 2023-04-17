from typing import List

from domain.flight_file.entities import FlightFile, ID_Type
from domain.flight_file.value_objects import AllowedFiles
from infrastructure.db.orm import FlightFile as FlightFilesModel
from infrastructure.repositories.base import BaseRepository
from sqlalchemy.orm import Session


class FlightFileRepository(BaseRepository):
    _model = FlightFilesModel
    _entity = FlightFile

    def get_by_flight(self, fk_flight: ID_Type, session: Session) -> List[FlightFile]:
        result = session.query(self._model).filter_by(**{"fk_flight": fk_flight}).all()
        return [self._model_to_schema(row) for row in result]

    def get_by_flight_and_type(
        self, fk_flight: ID_Type, file_type: AllowedFiles, session: Session
    ) -> FlightFile | None:
        result = session.query(self._model).filter_by(**{"fk_flight": fk_flight, "file_type": file_type}).first()
        if result:
            return self._model_to_schema(result)
        else:
            return None

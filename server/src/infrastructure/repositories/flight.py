from domain.flight.entities import Flight
from infrastructure.db.orm import Flight as FlightModel
from infrastructure.repositories.base import BaseRepository


class FlightRepository(BaseRepository):
    _model = FlightModel
    _entity = Flight

from application.services.base import BaseCRUDService
from domain.flight.entities import Flight


class FlightService(BaseCRUDService):
    _entity = Flight

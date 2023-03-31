from application.services.base import BaseCRUDService
from domain.drone.entities import Drone


class DroneService(BaseCRUDService):
    _entity = Drone

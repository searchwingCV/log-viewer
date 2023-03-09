from application.services.base import BaseCRUDService
from domain.plane.entities import Plane


class PlaneService(BaseCRUDService):
    _entity = Plane

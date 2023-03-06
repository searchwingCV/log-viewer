from application.services.base import BaseCRUDService
from domain.mission.entities import Mission


class MissionService(BaseCRUDService):
    _entity = Mission

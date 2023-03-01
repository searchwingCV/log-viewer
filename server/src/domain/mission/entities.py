from domain import DomainEntity
from pydantic import BaseModel


class BaseMission(BaseModel):
    mission_alias: str
    description: str
    location: str
    latitude: float
    longitude: float
    is_test: bool


class Mission(BaseMission, DomainEntity):
    pass

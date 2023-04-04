import typing as t
from datetime import date

from domain import AllOptional, DomainEntity
from pydantic import BaseModel


class BaseMission(BaseModel):
    class Config:
        orm_mode = True

    name: str
    description: t.Optional[str]
    location: str
    start_date: date
    end_date: date
    partner_organization: t.Optional[str]


class Mission(BaseMission, DomainEntity):
    pass


class MissionUpdate(BaseMission, metaclass=AllOptional):
    pass

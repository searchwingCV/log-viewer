import typing as t
from datetime import date

from domain import DomainEntity, DomainUpdate
from pydantic import BaseModel, validator


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


class MissionUpdate(BaseMission, DomainUpdate):
    @validator("name", "location", "start_date", pre=True)
    def _check_which_none(cls, v):
        if v is None:
            raise ValueError("should not be nullable")
        return v

import typing as t
from datetime import date

from domain import DomainEntity, DomainUpdate
from pydantic import BaseModel, root_validator


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
    @root_validator(pre=True)
    def _check_which_none(cls, values):
        for k in ["name", "location", "start_date"]:
            if k not in values:
                continue
            if values[k] is None:
                raise ValueError(f"'{k}' should not be nullable")

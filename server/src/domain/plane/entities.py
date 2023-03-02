from domain import DomainEntity
from pydantic import BaseModel, Field


class BasePlane(BaseModel):
    class Config:
        orm_mode = True

    alias: str
    model: str
    in_use: bool = Field(default=True)


class Plane(BasePlane, DomainEntity):
    pass

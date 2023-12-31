import typing as t

from domain import DomainEntity, DomainUpdate
from domain.drone.value_objects import DroneStatus
from pydantic import BaseModel, Field, validator


class BaseDrone(BaseModel):
    class Config:
        orm_mode = True

    name: str
    model: str
    description: t.Optional[str]
    status: DroneStatus = Field(default=DroneStatus.ready_for_flight)
    sys_thismav: int = Field(gt=0, lt=256)


class Drone(BaseDrone, DomainEntity):
    pass


class DroneUpdate(BaseDrone, DomainUpdate):
    @validator("name", "model", "status", pre=True)
    def _check_which_none(cls, v):
        if v is None:
            raise ValueError("should not be nullable")
        return v

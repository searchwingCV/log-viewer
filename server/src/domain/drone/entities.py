import typing as t

from domain import DomainEntity
from domain.drone.value_objects import DroneStatus
from pydantic import BaseModel, Field, validator


class BaseDrone(BaseModel):
    class Config:
        orm_mode = True

    name: str
    model: str
    description: t.Optional[str]
    status: DroneStatus = Field(default=DroneStatus.ready_for_flight)
    sys_thismav: int

    @validator("sys_thismav")
    def is_valid_sys_thismav(cls, v: int) -> int:
        if v not in [1, 2, 3]:
            raise ValueError(f"Invalid SYS_THISMAV value, should be one of [1, 2, 3] -> {v}")
        return v


class Drone(BaseDrone, DomainEntity):
    pass

import typing as t

from domain import DomainEntity, DomainUpdate
from domain.drone.value_objects import DroneStatus
from pydantic import BaseModel, Field, root_validator


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
    @root_validator(pre=True)
    def _check_which_none(cls, values):
        for k in ["name", "model", "status", "sys_thismav"]:
            if k not in values:
                continue
            if values[k] is None:
                raise ValueError(f"'{k}' should not be nullable")

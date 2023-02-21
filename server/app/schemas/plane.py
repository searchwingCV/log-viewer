from datetime import datetime
from typing import Optional, Union

import strawberry
from pydantic import Field

from ..models.metadata import PlaneDetails
from .base import BaseSchema


class BasePlaneSchema(BaseSchema):
    plane_alias: str = Field(alias="planeAlias")
    model: Optional[str] = Field(alias="model")
    in_use: bool = Field(alias="inUse", default=True)


class PlaneDetailsSchema(BasePlaneSchema):
    plane_id: Optional[int] = Field(alias="planeId")
    updated_at: Union[None, datetime] = Field(alias="updatedAt")
    created_at: datetime = Field(alias="createdAt")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


@strawberry.type
# @strawberry.experimental.pydantic.type(model=PlaneDetailsSchema, all_fields=True)
class PlaneGraphType:
    plane_id: int
    plane_alias: str
    model: str
    in_use: bool
    plane_id: int
    updated_at: Optional[datetime]
    created_at: datetime

    @classmethod
    def marshall(cls, model: PlaneDetails):
        return cls(
            plane_id=strawberry.ID(str(model.plane_id)),
            plane_alias=model.plane_alias,
            model=model.model,
            in_use=model.in_use,
            updated_at=model.updated_at,
            created_at=model.created_at,
        )


@strawberry.type
class BatteryMessage:
    time_us: int
    volt: float
    volt_r: float
    curr: float
    curr_tot: float
    enrg_tot: float
    temp: float
    res: float

    @classmethod
    def marshall(cls, data):

        return cls(
            time_us=data[0],
            volt=data[1],
            volt_r=data[2],
            curr=data[3],
            curr_tot=data[4],
            enrg_tot=data[5],
            temp=data[6],
            res=data[7],
        )

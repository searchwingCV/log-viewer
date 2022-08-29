import strawberry
from ..models.metadata import PlaneDetails
from datetime import datetime
from .base import BaseSchema
from typing import Optional, Union
from pydantic import Field


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

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, validator, Field
from ..internal.pydantic_handle_geom import create_geom
from typing import Optional
from shapely.geometry import Point


class BaseSchema(BaseModel):
    def to_json(self, **kwargs):
        return jsonable_encoder(self, **kwargs)


class BasePageResponse(BaseSchema):
    total: int = 0
    next: str = ""
    previous: str = ""
    page: int = 0
    size: int = 20


class GeoPoint(BaseSchema):
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True

    geo: Optional[Point] = Field(None, alias="point")

    _validate_geom = validator("geo", pre=True, always=True, allow_reuse=True)(
        create_geom
    )

from __future__ import annotations

from math import ceil
from typing import Generic, Optional, Sequence, TypeVar

from fastapi import Query
from fastapi.encoders import jsonable_encoder
from fastapi_pagination.bases import AbstractPage, AbstractParams, RawParams
from humps import camelize
from presentation.rest.serializers.utils.pydantic_handle_geom import create_geom
from pydantic import BaseModel, Field, conint, validator
from shapely.geometry import Point

T = TypeVar("T")


def convert_to_camel(field: str) -> str:
    return camelize(field)


class APISerializer(BaseModel):
    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        alias_generator = convert_to_camel

    def to_json(self, **kwargs):
        return jsonable_encoder(self, **kwargs)


class APIGeoSerializer(APISerializer):
    @validator("latitude", check_fields=False)
    def is_valid_latitude(lat: float):
        if abs(lat) > 90:
            raise ValueError("Latitude must be between -90 and 90 degrees")
        return lat

    @validator("longitude", check_fields=False)
    def is_valid_longitude(lon: float):
        if abs(lon) > 180:
            raise ValueError("Longitude must be between -180 and 180 degrees")
        return lon


class Params(BaseModel, AbstractParams):
    page: int = Query(1, ge=1, description="Page number")
    size: int = Query(50, ge=1, le=100, description="Page size")
    path: str = "/base"

    def to_raw_params(self) -> RawParams:
        return RawParams(
            limit=self.size,
            offset=self.size * (self.page - 1),
        )

    def get_next_path(self, total):
        if not self.page >= ceil(total / self.size):
            next_page = self.page + 1
            return self.path + f"?page={next_page}&size={self.size}"
        else:
            return ""

    def get_prev_path(self):
        if self.page != 1:
            prev_page = self.page - 1
            return self.path + f"?page={prev_page}&size={self.size}"
        else:
            return ""


class Page(AbstractPage[T], Generic[T]):
    items: Sequence[T]
    total: conint(ge=0)  # type: ignore
    page: conint(ge=1)  # type: ignore
    size: conint(ge=1)  # type: ignore
    next: str = ""
    prev: str = ""

    __params_type__ = Params  # Set params related to Page

    @classmethod
    def create(
        cls,
        items: Sequence[T],
        total: int,
        params: AbstractParams,
    ) -> Page[T]:
        if not isinstance(params, Params):
            raise ValueError("Page should be used with Params")

        return cls(
            total=total,
            items=items,
            page=params.page,
            size=params.size,
            next=params.get_next_path(total),
            prev=params.get_prev_path(),
        )


class GeoPoint(BaseModel):
    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        arbitrary_types_allowed = True

    geo: Optional[Point] = Field(None, alias="point")

    _validate_geom = validator("geo", pre=True, always=True, allow_reuse=True)(create_geom)

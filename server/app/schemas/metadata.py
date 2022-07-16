from datetime import datetime
from .base import BaseSchema, GeoPoint
from typing import Optional, Union
from pydantic import constr, Field
from ..constants import MAX_MISSION_ALIAS_LEN
from ..models.metadata import WeatherCondititions


class BasePlaneSchema(BaseSchema):
    alias: str = Field(alias="planeAlias")
    model: Optional[str] = Field(alias="model")
    in_use: bool = Field(alias="inUse", default=True)


class PlaneDetailsSchema(BasePlaneSchema):
    plane_id: Optional[int] = Field(alias="planeId")
    updated_at: Union[None, datetime] = Field(alias="updatedAt")
    created_at: datetime = Field(alias="createdAt")

    class Config:
        orm_mode = True


class MissionDetailsSchema(BaseSchema):
    mission_id: Optional[int] = Field(alias="missionId")
    mission_alias: constr(max_length=MAX_MISSION_ALIAS_LEN) = Field(
        alias="missionAlias"
    )
    description: str = Field(alias="description")
    location: float = Field(alias="location")
    longitude: float = Field(alias="longitude")
    geo: Optional[GeoPoint] = Field(alias="geo")
    pilot: Optional[str] = Field(alias="pilot")
    observer: Optional[str] = Field(alias="observer")
    weather: Optional[WeatherCondititions] = Field(alias="weather")
    temperature: Optional[int] = Field(alias="temperature")
    updated_at: datetime = Field(alias="updatedAt")
    created_at: datetime = Field(alias="createdAt")

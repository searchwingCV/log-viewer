from datetime import datetime
from .base import BaseSchema
from typing import Optional
from pydantic import constr
from ...constants import MAX_MISSION_ALIAS_LEN
from ..models.metadata import WeatherCondititions
from shapely.geometry import Point


class PlaneDetailsSchema(BaseSchema):
    plane_id: Optional[int]
    plane_alias: str
    model: Optional[str]
    in_use: bool
    updated_at: datetime
    created_at: datetime

    class Config:
        orm_mode = True


class MissionDetailsSchema(BaseSchema):
    mission_id: Optional[int]
    mission_alias: constr(max_length=MAX_MISSION_ALIAS_LEN)
    description: str
    location: float
    longitude: float
    geo: Optional[Point]
    pilot: Optional[str]
    observer: Optional[str]
    weather: Optional[WeatherCondititions]
    temperature: Optional[int]

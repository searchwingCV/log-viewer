from datetime import datetime
from typing import Optional, Union

from pydantic import Field, validator
from src.schemas.base import BaseSchema, GeoPoint


class BaseMissionSchema(BaseSchema):
    mission_alias: str = Field(alias="missionAlias")
    description: str = Field(alias="description")
    location: str = Field(alias="location")
    latitude: float = Field(alias="latitude")
    longitude: float = Field(alias="longitude")
    is_test: bool = Field(alias="isTest")

    @validator("latitude")
    def is_valid_latitude(lat: float):
        if abs(lat) > 90:
            raise ValueError("Latitude must be between -90 and 90 degrees")
        return lat

    @validator("longitude")
    def is_valid_longitude(lon: float):
        if abs(lon) > 180:
            raise ValueError("Longitude must be between -180 and 180 degrees")
        return lon


class MissionSchema(BaseMissionSchema):
    """
    Final Pydantic model that represents the DB schema
    """

    mission_id: Optional[int] = Field(alias="missionId")
    updated_at: Optional[Union[None, datetime]] = Field(alias="updatedAt")
    created_at: Optional[datetime] = Field(alias="createdAt")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class MissionSchemaGeo(MissionSchema, GeoPoint):
    pass


class MissionDeletion(BaseSchema):
    msg: str
    mission_id: int

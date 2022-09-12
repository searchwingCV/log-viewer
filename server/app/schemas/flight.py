from .base import BaseSchema
from ..models.metadata import WeatherCondititions
from typing import Optional, Union
from pydantic import Field, validator
from datetime import datetime


class BaseFlightSchema(BaseSchema):
    average_speed: Optional[float] = Field(
        alias="averageSpeed", description="The average flight speed in km/h"
    )
    plane_id: int = Field(alias="planeId")
    mission_id: int = Field(alias="missionId")
    distance: Optional[float] = Field(
        alias="distance", description="The flown distance in km"
    )
    latitude: Optional[float] = Field(alias="latitude")
    longitude: Optional[float] = Field(alias="longitude")
    pilot: Optional[str] = Field(alias="pilot")
    observer: Optional[str] = Field(alias="observer")
    weather_conditions: Optional[WeatherCondititions] = Field(alias="weatherConditions")
    temperature: Optional[float] = Field(
        alias="temperature", description="The temperature in ˚C"
    )
    start_time: Optional[datetime] = Field(alias="startTime")
    end_time: Optional[datetime] = Field(alias="endTime")
    notes: Optional[str] = Field(alias="notes")

    @validator("latitude")
    def is_valid_latitude(lat: float):
        if lat is not None:
            if abs(lat) > 90:
                raise ValueError("Latitude must be between -90 and 90 degrees")
            return lat
        else:
            return lat

    @validator("longitude")
    def is_valid_longitude(lon: float):
        if lon is not None:
            if abs(lon) > 180:
                raise ValueError("Longitude must be between -180 and 180 degrees")
            return lon
        else:
            return lon


class FlightSchema(BaseFlightSchema):
    """
    Final Pydantic model that represents the DB schema
    """

    flight_id: Optional[int] = Field(alias="flightId")
    updated_at: Optional[Union[None, datetime]] = Field(alias="updatedAt")
    created_at: Optional[datetime] = Field(alias="createdAt")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class FlightDeletion(BaseSchema):
    msg: str
    flight_id: int

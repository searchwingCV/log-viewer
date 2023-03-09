from datetime import datetime
from typing import Optional

from domain import DomainEntity
from domain.flight.value_objects import AllowedFiles, WeatherCondititions
from domain.types import ID_Type
from pydantic import BaseModel, Field


class BaseFlight(BaseModel):
    class Config:
        orm_mode = True

    average_speed: Optional[float] = None
    fk_plane: ID_Type
    fk_mission: Optional[ID_Type]
    distance: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    pilot: Optional[str] = None
    observer: Optional[str] = None
    weather_conditions: Optional[WeatherCondititions] = None
    temperature: Optional[float] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    notes: Optional[str] = None


class Flight(BaseFlight, DomainEntity):
    pass


class FlightFile(DomainEntity):
    uri: str  # The full URI including storage scheme (sftp, s3, file...)
    location: str  # The relative path in the default storage system
    file_type: AllowedFiles
    fk_flight: ID_Type
    version: int = Field(default=1)

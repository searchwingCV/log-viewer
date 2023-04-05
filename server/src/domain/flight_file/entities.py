from io import BytesIO

from domain import DomainEntity
from domain.flight_file.value_objects import AllowedFiles
from domain.types import ID_Type
from pydantic import BaseModel, Field


class BaseFlightFile(BaseModel):
    location: str  # The relative path in the default storage system
    file_type: AllowedFiles
    fk_flight: ID_Type
    version: int = Field(default=1)


class FlightFile(BaseFlightFile, DomainEntity):
    pass


class IOFile(object):
    def __init__(self, flight_file: FlightFile, io: BytesIO):
        self.flight_file = flight_file
        self.io = io

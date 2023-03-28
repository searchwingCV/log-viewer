from datetime import datetime, timedelta
from typing import Optional

from domain import DomainEntity
from domain.flight.value_objects import AllowedFiles, FlightPurpose, FlightRating, WindIntensity
from domain.types import ID_Type
from pydantic import BaseModel, Field


class IBaseFlight(BaseModel):
    class Config:
        orm_mode = True

    # user-defined and editable fields

    fk_drone: ID_Type
    fk_mission: Optional[ID_Type]
    location: str = Field(description="A short description of the location")
    pilot: Optional[str] = Field(default=None, description="The pilot reference (to be replaced with ID)")
    observer: Optional[str] = Field(default=None, description="The observer while flying")
    rating: FlightRating = Field(description="A rating for the flight: good/problems/crash")
    purpose: FlightPurpose = Field(description="The purpose of the flight: test/training/mission")
    notes: Optional[str] = Field(default=None, description="Some notes about the flight")
    drone_needs_repair: bool = Field(default=False)


class BaseComputedFields(BaseModel):
    class Config:
        orm_mode = True

    # fields derived from Weather API - More to be added
    temperature_celsius: Optional[float] = Field(default=None, description="Air temperature in degrees Celsius")

    wind: Optional[WindIntensity] = Field(
        default=None,
        description="The wind intensity: Strong > 5 bft, Medium 2..4 bft, Calm 1..2 bft",
    )

    # fields computed from log file - all should be null by default

    log_start_time: Optional[datetime] = None
    log_end_time: Optional[datetime] = None
    log_duration: Optional[timedelta] = None

    start_latitude: Optional[str] = None
    start_longitude: Optional[str] = None
    end_latitude: Optional[str] = None
    end_longitude: Optional[str] = None

    hardware_version: Optional[str] = None
    firmware_version: Optional[str] = None

    distance_km: Optional[float] = None

    max_groundspeed: Optional[float] = None
    min_groundspeed: Optional[float] = None
    avg_groundspeed: Optional[float] = None

    max_airspeed: Optional[float] = None
    min_airspeed: Optional[float] = None
    avg_airspeed: Optional[float] = None

    max_vertical_speed_up: Optional[float] = None
    max_vertical_speed_down: Optional[float] = None

    max_telemetry_distance_km: Optional[float] = None

    max_battery_voltage: Optional[float]
    min_battery_voltage: Optional[float]
    delta_battery_voltage: Optional[float]

    min_power_w: Optional[float]
    max_power_w: Optional[float]
    avg_power_w: Optional[float]

    min_windspeed_kmh: Optional[float]
    avg_windspeed_kmh: Optional[float]
    max_windspeed_kmh: Optional[float]

    energy_consumed_wh: Optional[float]


class BaseFlight(BaseComputedFields, IBaseFlight):
    pass


class Flight(BaseFlight, DomainEntity):
    pass


class FlightFile(DomainEntity):
    uri: str  # The full URI including storage scheme (sftp, s3, file...)
    location: str  # The relative path in the default storage system
    file_type: AllowedFiles
    fk_flight: ID_Type
    version: int = Field(default=1)

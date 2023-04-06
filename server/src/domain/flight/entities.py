from datetime import datetime, timedelta
from typing import Optional

from domain import AllOptional, DomainEntity
from domain.flight.value_objects import FlightPurpose, FlightRating, WindIntensity
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
    rating: Optional[FlightRating] = Field(description="A rating for the flight: good/problems/crash")
    purpose: Optional[FlightPurpose] = Field(description="The purpose of the flight: test/training/mission")
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

    max_groundspeed_kmh: Optional[float] = None
    min_groundspeed_kmh: Optional[float] = None
    avg_groundspeed_kmh: Optional[float] = None

    max_airspeed_kmh: Optional[float] = None
    min_airspeed_kmh: Optional[float] = None
    avg_airspeed_kmh: Optional[float] = None

    max_vertical_speed_up_kmh: Optional[float] = None
    max_vertical_speed_down_kmh: Optional[float] = None

    max_telemetry_distance_km: Optional[float] = None

    max_battery_voltage: Optional[float]
    min_battery_voltage: Optional[float]
    delta_battery_voltage: Optional[float]

    max_battery_current_a: Optional[float]
    min_battery_current_a: Optional[float]
    avg_battery_current_a: Optional[float]

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


class FlightUpdate(IBaseFlight, metaclass=AllOptional):
    pass

from datetime import datetime as dt

from common.constants import MAX_MISSION_ALIAS_LEN
from domain.drone.value_objects import DroneStatus
from domain.flight.value_objects import FlightPurpose, FlightRating, WindIntensity
from geoalchemy2 import Geometry
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    Interval,
    String,
    Table,
    Text,
    event,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class BaseModel(Base):
    __abstract__ = True
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, nullable=False, default=dt.now)
    updated_at = Column(DateTime, onupdate=dt.now)


class Drone(BaseModel):
    __tablename__ = "drone"
    """
    from domain::
    name: str
    model: str
    description: t.Optional[str]
    status: DroneStatus = Field(default=DroneStatus.ready_for_flight)
    """
    name = Column(String, nullable=False, unique=True)
    model = Column(String, nullable=False)
    description = Column(String)
    status = Column(Enum(DroneStatus), nullable=False)
    sys_thismav = Column(Integer, nullable=False)


drone_flight_association = Table(
    "drone_mission_association",
    Base.metadata,
    Column("drone_id", ForeignKey("drone.id"), primary_key=True),
    Column("flight_id", ForeignKey("flight.id"), primary_key=True),
)

misssion_flight_association = Table(
    "misssion_flight_association",
    Base.metadata,
    Column("mission_id", ForeignKey("mission.id"), primary_key=True),
    Column("flight_id", ForeignKey("flight.id"), primary_key=True),
)


class Mission(BaseModel):
    __tablename__ = "mission"

    name = Column(String(MAX_MISSION_ALIAS_LEN), unique=True, nullable=False)
    description = Column(String, nullable=False)
    location = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    partner_organization = Column(String)


class Flight(BaseModel):
    __tablename__ = "flight"
    # user defined fields
    fk_drone = Column(Integer, ForeignKey("drone.id"), nullable=False)
    fk_mission = Column(Integer, ForeignKey("mission.id"))
    location = Column(String, nullable=False)
    pilot = Column(String)
    observer = Column(String)
    rating = Column(Enum(FlightRating), nullable=True)
    purpose = Column(Enum(FlightPurpose), nullable=True)
    notes = Column(Text)
    drone_needs_repair = Column(Boolean, default=False, nullable=False)

    # From weather API
    temperature_celsius = Column(Float)
    wind = Column(Enum(WindIntensity))

    # Computed from logs
    log_start_time = Column(DateTime)
    log_end_time = Column(DateTime)
    log_duration = Column(Interval)

    start_latitude = Column(String)
    start_longitude = Column(String)
    start_geo = Column(Geometry(geometry_type="POINT"))

    end_latitude = Column(String)
    end_longitude = Column(String)
    end_geo = Column(Geometry(geometry_type="POINT"))

    hardware_version = Column(String)
    firmware_version = Column(String)

    distance_km = Column(Float)

    max_groundspeed_kmh = Column(Float)
    min_groundspeed_kmh = Column(Float)
    avg_groundspeed_kmh = Column(Float)

    max_airspeed_kmh = Column(Float)
    min_airspeed_kmh = Column(Float)
    avg_airspeed_kmh = Column(Float)

    max_vertical_speed_up_kmh = Column(Float)
    max_vertical_speed_down_kmh = Column(Float)

    max_telemetry_distance_km = Column(Float)

    max_battery_voltage = Column(Float)
    min_battery_voltage = Column(Float)
    delta_battery_voltage = Column(Float)

    max_battery_current_a = Column(Float)
    min_battery_current_a = Column(Float)
    avg_battery_current_a = Column(Float)

    max_power_w = Column(Float)
    min_power_w = Column(Float)
    avg_power_w = Column(Float)

    max_windspeed_kmh = Column(Float)
    min_windspeed_kmh = Column(Float)
    avg_windspeed_kmh = Column(Float)

    energy_consumed_wh = Column(Float)

    # relations
    drone = relationship("Drone", secondary=drone_flight_association)
    mission = relationship("Mission", secondary=misssion_flight_association)
    files = relationship("FlightFile")
    mavlink_timeseries = relationship("MavLinkTimeseries")


class FlightFile(BaseModel):
    __tablename__ = "flight_file"
    file_type = Column(String, nullable=False)
    location = Column(String, nullable=False)
    fk_flight = Column(Integer, ForeignKey("flight.id"))
    version = Column(Integer, nullable=False, default=1)


class MavLinkTimeseries(Base):
    __tablename__ = "mavlink_timeseries"

    flight_id = Column(Integer, ForeignKey("flight.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    message_type = Column(String, nullable=False)
    message_field = Column(String, nullable=False)
    value = Column(Float)

    __mapper_args__ = {"primary_key": [flight_id, timestamp, message_field]}


@event.listens_for(Flight, "before_insert")
@event.listens_for(Flight, "before_update")
def calculate_geo_flight(mapper, connect, target):
    if all((target.start_latitude is not None, target.start_longitude is not None)):
        target.start_geo = f"SRID=4269; POINT({target.start_latitude} {target.start_longitude})"
    else:
        target.start_geo = None

    if all((target.end_latitude is not None, target.end_longitude is not None)):
        target.end_geo = f"SRID=4269; POINT({target.end_latitude} {target.end_longitude})"
    else:
        target.end_geo = None

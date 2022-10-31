import enum
from datetime import datetime as dt

from geoalchemy2 import Geometry

# fmt: off
from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, String, Table, event

# fmt: on
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

from ..constants import MAX_MISSION_ALIAS_LEN

Base = declarative_base()


class PlaneDetails(Base):
    __tablename__ = "plane_details"

    plane_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plane_alias = Column(String, unique=True, nullable=False)
    model = Column(String, nullable=True)
    in_use = Column(Boolean, default=True)
    created_at = Column(DateTime, nullable=False, default=dt.now)
    updated_at = Column(DateTime, nullable=True, onupdate=dt.now)


class WeatherCondititions(str, enum.Enum):
    sunny = "sunny"
    windy = "windy"
    cloudy = "cloudy"
    rainy = "rainy"
    snow = "snow"


plane_flight_association = Table(
    "plane_mission_association",
    Base.metadata,
    Column("plane_id", ForeignKey("plane_details.plane_id"), primary_key=True),
    Column("flight_id", ForeignKey("flight.flight_id"), primary_key=True),
)

misssion_flight_association = Table(
    "misssion_flight_association",
    Base.metadata,
    Column("mission_id", ForeignKey("mission_details.mission_id"), primary_key=True),
    Column("flight_id", ForeignKey("flight.flight_id"), primary_key=True),
)


class MissionDetails(Base):
    __tablename__ = "mission_details"

    mission_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mission_alias = Column(String(MAX_MISSION_ALIAS_LEN), unique=True, nullable=False)
    description = Column(String, nullable=False)
    location = Column(String, nullable=True)
    longitude = Column(Float)
    latitude = Column(Float)
    geo = Column(Geometry(geometry_type="POINT"))
    is_test = Column(Boolean, default=True)
    created_at = Column(DateTime, nullable=False, default=dt.now)
    updated_at = Column(DateTime, onupdate=dt.now)


@event.listens_for(MissionDetails, "before_insert")
@event.listens_for(MissionDetails, "before_update")
def calculate_geo_mission(mapper, connect, target):
    target.geo = f"SRID=4269; POINT({target.latitude} {target.longitude})"


class Flight(Base):
    __tablename__ = "flight"
    flight_id = Column(Integer, primary_key=True, autoincrement=True)
    plane_id = Column(Integer, ForeignKey("plane_details.plane_id"), nullable=False)
    mission_id = Column(
        Integer, ForeignKey("mission_details.mission_id"), nullable=False
    )
    average_speed = Column(Float, nullable=True)
    distance = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    latitude = Column(Float, nullable=True)
    geo = Column(Geometry(geometry_type="POINT"), nullable=True)
    pilot = Column(String, nullable=True)
    observer = Column(String, nullable=True)
    weather_conditions = Column(Enum(WeatherCondititions), nullable=True)
    temperature = Column(Integer, nullable=True)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=dt.now)
    updated_at = Column(DateTime, onupdate=dt.now)
    plane = relationship("PlaneDetails", secondary=plane_flight_association)
    mission = relationship("MissionDetails", secondary=misssion_flight_association)
    log_file = relationship("LogFile")
    tfile = relationship("TelemetryFile")
    notes = Column(String, nullable=True)


class LogFile(Base):
    __tablename__ = "logfile"
    file_id = Column(Integer, primary_key=True, autoincrement=True)
    file_uri = Column(String)
    flight_id = Column(Integer, ForeignKey("flight.flight_id"))


class TelemetryFile(Base):
    __tablename__ = "telemetry_file"
    tfile_id = Column(Integer, primary_key=True, autoincrement=True)
    file_uri = Column(String)
    flight_id = Column(Integer, ForeignKey("flight.flight_id"))


@event.listens_for(Flight, "before_insert")
@event.listens_for(Flight, "before_update")
def calculate_geo_flight(mapper, connect, target):
    if all((target.latitude is not None, target.longitude is not None)):
        target.geo = f"SRID=4269; POINT({target.latitude} {target.longitude})"
    else:
        target.geo = None

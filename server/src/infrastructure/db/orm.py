from datetime import datetime as dt

from common.constants import MAX_MISSION_ALIAS_LEN
from domain.flight.value_objects import WeatherCondititions
from geoalchemy2 import Geometry
from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, String, Table, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class BaseModel(Base):
    __abstract__ = True
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, nullable=False, default=dt.now)
    updated_at = Column(DateTime, nullable=True, onupdate=dt.now)


class Plane(BaseModel):
    __tablename__ = "plane"

    alias = Column(String, unique=True, nullable=False)
    model = Column(String, nullable=True)
    in_use = Column(Boolean, default=True)


plane_flight_association = Table(
    "plane_mission_association",
    Base.metadata,
    Column("plane_id", ForeignKey("plane.id"), primary_key=True),
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

    mission_alias = Column(String(MAX_MISSION_ALIAS_LEN), unique=True, nullable=False)
    description = Column(String, nullable=False)
    location = Column(String, nullable=True)
    longitude = Column(Float)
    latitude = Column(Float)
    geo = Column(Geometry(geometry_type="POINT"))
    is_test = Column(Boolean, default=True)


@event.listens_for(Mission, "before_insert")
@event.listens_for(Mission, "before_update")
def calculate_geo_mission(mapper, connect, target):
    target.geo = f"SRID=4269; POINT({target.latitude} {target.longitude})"


class Flight(BaseModel):
    __tablename__ = "flight"
    plane_id = Column(Integer, ForeignKey("plane.id"), nullable=False)
    mission_id = Column(Integer, ForeignKey("mission.id"), nullable=False)
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
    plane = relationship("Plane", secondary=plane_flight_association)
    mission = relationship("Mission", secondary=misssion_flight_association)
    files = relationship("FlightFiles")


class FlightFiles(Base):
    __tablename__ = "flight_files"
    file_type = Column(String, Enum(WeatherCondititions), nullable=False)
    location = Column(String, Enum(WeatherCondititions), nullable=False)
    file_uri = Column(String, unique=True, primary_key=True)
    flight_id = Column(Integer, ForeignKey("flight.id"))
    version = Column(Integer, nullable=False, default=1)


@event.listens_for(Flight, "before_insert")
@event.listens_for(Flight, "before_update")
def calculate_geo_flight(mapper, connect, target):
    if all((target.latitude is not None, target.longitude is not None)):
        target.geo = f"SRID=4269; POINT({target.latitude} {target.longitude})"
    else:
        target.geo = None

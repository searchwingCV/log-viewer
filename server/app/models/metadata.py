import enum
from ..constants import MAX_MISSION_ALIAS_LEN
from datetime import datetime as dt
from sqlalchemy import (
    Table,
    Float,
    ForeignKey,
    Integer,
    Boolean,
    Column,
    String,
    DateTime,
    event,
    Enum,
)
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class PlaneDetails(Base):
    __tablename__ = "plane_details"

    plane_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plane_alias = Column(String, unique=True, nullable=False)
    model = Column(String, nullable=True)
    in_use = Column(Boolean, default=True)
    created_at = Column(DateTime, nullable=False, default=dt.now)
    updated_at = Column(DateTime, nullable=True, onupdate=dt.now)


class WeatherCondititions(enum.Enum):
    sunny = "sunny"
    windy = "windy"
    cloudy = "cloudy"
    rainy = "rainy"
    snow = "snow"


plane_mission_association = Table(
    "plane_mission_association",
    Base.metadata,
    Column("plane_id", ForeignKey("plane_details.plane_id"), primary_key=True),
    Column("mission_id", ForeignKey("mission_details.mission_id"), primary_key=True),
)


class MissionDetails(Base):
    __tablename__ = "mission_details"

    mission_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mission_alias = Column(String(MAX_MISSION_ALIAS_LEN), unique=True, nullable=False)
    description = Column(String, unique=True, nullable=False)
    location = Column(String, nullable=True)
    longitude = Column(Float)
    latitude = Column(Float)
    geo = Column(Geometry(geometry_type="POINT"))
    pilot = Column(String, nullable=True)
    observer = Column(String, nullable=True)
    weather_conditions = Column(Enum(WeatherCondititions), nullable=True)
    temperature = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=False, default=dt.now)
    updated_at = Column(DateTime, nullable=False, onupdate=dt.now)
    file = relationship("LogFile")
    plane = relationship("PlaneDetails", secondary=plane_mission_association)


@event.listens_for(MissionDetails, "before_insert")
def calculate_geo(mapper, connect, target):
    target.geo = f"POINT({target.latitude}, {target.longitude})"


class LogFile(Base):
    __tablename__ = "log_file"
    file_id = Column(Integer, primary_key=True, autoincrement=True)
    file_path = Column(String)
    mission_id = Column(Integer, ForeignKey("mission_details.mission_id"))

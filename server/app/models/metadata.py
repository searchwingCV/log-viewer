import enum
from ...constants import MAX_MISSION_ALIAS_LEN
from datetime import datetime as dt
from sqlalchemy import Float, Integer, Boolean, Column, String, DateTime, event
from geoalchemy2 import Geometry
from . import Base


class PlaneDetails(Base):
    __tablename__ = "plane_details"

    plane_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plane_alias = Column(String, unique=True, nullable=False)
    model = Column(String, nullable=True)
    in_use = Column(Boolean, default=True)
    created_at = Column(DateTime, nullable=False, default=dt.now)
    updated_at = Column(DateTime, nullable=False, onupdate=dt.now)


class WeatherCondititions(enum.Enum):
    sunny = "sunny"
    windy = "windy"
    cloudy = "cloudy"
    rainy = "rainy"
    snow = "snow"


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
    weather_conditions = Column(WeatherCondititions, nullable=True)
    temperature = Column(Integer, nullable=True)


@event.listens_for(MissionDetails, "before_insert")
def calculate_geo(mapper, connect, target):
    target.geo = f"POINT({target.latitude}, {target.longitude})"

import typing as t
from datetime import datetime

from domain.types import ID_Type
from pydantic import BaseModel


class TimeseriesValues(BaseModel):
    timestamp: datetime
    value: float


class MavLinkTimeseries(BaseModel):
    class Config:
        orm_mode = True

    flight_id: ID_Type
    message_type: str
    message_field: str
    values: t.List[TimeseriesValues]

    @classmethod
    def build_from_entries(
        cls, flight_id: ID_Type, message_type: str, message_field: str, entries: t.List[datetime | float]
    ):
        return cls(
            flight_id=flight_id,
            message_type=message_type,
            message_field=message_field,
            values=[
                TimeseriesValues(
                    timestamp=entry.timestamp,
                    value=entry.value,
                )
                for entry in entries
            ],
        )

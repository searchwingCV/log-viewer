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
        cls, flight_id: ID_Type, message_type: str, message_field: str, entries: t.List[t.Tuple[datetime, float]]
    ):
        return cls(
            flight_id=flight_id,
            message_type=message_type,
            message_field=message_field,
            values=[
                TimeseriesValues(
                    timestamp=entry[0],
                    value=entry[1],
                )
                for entry in entries
            ],
        )


class MavlinkMessageField(BaseModel):
    name: str
    unit: t.Optional[str]


class MavLinkMessageProperties(BaseModel):
    message_type: str
    message_fields: t.List[MavlinkMessageField]


class MavLinkFlightMessageProperties(BaseModel):
    flight_id: ID_Type
    start_timestamp: datetime | None
    end_timestamp: datetime | None
    message_properties: t.List[MavLinkMessageProperties]

    def add_entries(self, entries: t.List[t.Tuple[str, str]]):
        unique_message_types = set([e[1] for e in entries])
        for message_type in unique_message_types:
            fields = [MavlinkMessageField(name=f[2]) for f in filter(lambda x: x[1] == message_type, entries)]
            self.message_properties.append(MavLinkMessageProperties(message_type=message_type, message_fields=fields))


class FlightModeRange(BaseModel):
    flight_mode: str
    start_timestamp: datetime
    end_timestamp: datetime

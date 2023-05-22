from datetime import datetime

from domain.types import ID_Type
from pydantic import BaseModel


class IMavLinkTimeseries(BaseModel):
    class Config:
        orm_mode = True

    flight_id: ID_Type
    timestamp: datetime
    message_type: str
    message_field: str
    value: float


class MavLinkTimeseries(IMavLinkTimeseries):
    pass

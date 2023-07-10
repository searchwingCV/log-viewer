import typing as t
from datetime import datetime

from domain.mavlink_timeseries.entities import (
    FlightModeRange,
    MavLinkFlightMessageProperties,
    MavlinkMessageField,
    MavLinkMessageProperties,
    MavLinkTimeseries,
)
from presentation.rest.serializers import APISerializer
from pydantic import Field


class MavLinkMessagePropertiesSerializer(MavLinkMessageProperties, APISerializer):
    message_type: str
    message_fields: t.List[MavlinkMessageField]


class FlightModeRangeSerializer(FlightModeRange, APISerializer):
    ...


class MavLinkFlightMessagePropertiesSerializer(MavLinkFlightMessageProperties, APISerializer):
    message_properties: t.List[MavLinkMessagePropertiesSerializer]
    flight_mode_timeseries: t.List[FlightModeRangeSerializer] = Field(
        default=[],
        example=[
            FlightModeRangeSerializer(
                **{
                    "flightMode": "FBW1",
                    "startTimestamp": datetime.now(),
                    "endTimestamp": datetime.now(),
                }
            ),
            FlightModeRangeSerializer(
                **{
                    "flightMode": "AUTO",
                    "startTimestamp": datetime.now(),
                    "endTimestamp": datetime.now(),
                }
            ),
        ],
    )


class MavLinkTimeseriesSerializer(MavLinkTimeseries, APISerializer):
    ...

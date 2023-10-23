import json
from datetime import datetime

from domain.mavlink_timeseries.entities import (
    MavLinkFlightMessageProperties,
    MavlinkMessageField,
    MavLinkMessageProperties,
    MavLinkTimeseries,
    TimeseriesValues,
)
from presentation.rest.dependencies import get_log_processing_service


def test_get_mavlink_props(test_client, mock_log_processing_service, mock_flight_service, get_sample_flight):
    sample_flight = get_sample_flight()
    sample_flight.log_start_time = datetime(2021, 1, 1, 0)
    sample_flight.log_end_time = datetime(2021, 1, 1, 1)
    mock_flight_service.get_by_id.return_value = sample_flight
    mock_log_processing_service.get_message_properties.return_value = MavLinkFlightMessageProperties(
        flight_id=1,
        message_properties=[
            MavLinkMessageProperties(message_type="FOO", message_fields=[MavlinkMessageField(name="Bar", unit="Baz")]),
            MavLinkMessageProperties(message_type="BAR", message_fields=[MavlinkMessageField(name="Foo")]),
        ],
        start_timestamp=sample_flight.log_start_time,
        end_timestamp=sample_flight.log_end_time,
    )
    test_client.app.dependency_overrides[get_log_processing_service] = lambda: mock_log_processing_service
    expected = """
    [{
        "flightId": 1,
        "startTimestamp": "2021-01-01T00:00:00",
        "endTimestamp": "2021-01-01T01:00:00",
        "messageProperties": [
            {
                "messageType": "FOO",
                "messageFields": [
                    {"name": "Bar", "unit": "Baz"}
                ]
            },
            {
                "messageType": "BAR",
                "messageFields": [
                    {"name": "Foo"}
                ]
            }
        ],
            "flightModeTimeseries": []
    }]
    """
    response = test_client.get("/mavlink/message-properties?flight_id=1")
    assert response.status_code == 200
    assert response.json() == json.loads(expected)

    test_client.app.dependency_overrides.clear()


def test_get_timeseries(test_client, mock_log_processing_service):
    mock_log_processing_service.get_timeseries.return_value = MavLinkTimeseries(
        flight_id=1,
        message_type="FOO",
        message_field="Bar",
        values=[
            TimeseriesValues(timestamp=datetime(2021, 1, 1), value=1.0),
            TimeseriesValues(timestamp=datetime(2021, 1, 1), value=2.0),
        ],
    )
    test_client.app.dependency_overrides[get_log_processing_service] = lambda: mock_log_processing_service
    expected = """
    {
        "flightId": 1,
        "messageType": "FOO",
        "messageField": "Bar",
        "values": [
            {"timestamp": "2021-01-01T00:00:00", "value": 1.0},
            {"timestamp": "2021-01-01T00:00:00", "value": 2.0}
        ]
    }
    """
    response = test_client.get("/mavlink/timeseries?flight_id=1&message_type=FOO&message_field=Bar")

    assert response.status_code == 200
    assert response.json() == json.loads(expected)

    test_client.app.dependency_overrides.clear()

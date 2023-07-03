import json

from domain.mavlink_timeseries.entities import (
    MavLinkFlightMessageProperties,
    MavlinkMessageField,
    MavLinkMessageProperties,
)
from presentation.rest.dependencies import get_log_processing_service


def test_get_mavlink_props(test_client, mock_log_processing_service):
    mock_log_processing_service.get_message_properties.return_value = MavLinkFlightMessageProperties(
        flight_id=1,
        message_properties=[
            MavLinkMessageProperties(message_type="FOO", message_fields=[MavlinkMessageField(name="Bar", unit="Baz")]),
            MavLinkMessageProperties(message_type="BAR", message_fields=[MavlinkMessageField(name="Foo")]),
        ],
    )
    test_client.app.dependency_overrides[get_log_processing_service] = lambda: mock_log_processing_service
    expected = """
    {
        "flightId": 1,
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
    }
    """
    response = test_client.get("/mavlink/message-properties?flight_id=1")

    assert response.status_code == 200
    assert response.json() == json.loads(expected)

    test_client.app.dependency_overrides.clear()

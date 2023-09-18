import pytest
from presentation.rest.serializers.mavlink import MavLinkTimeseriesQuery


@pytest.mark.parametrize(
    "flight_id, message_types, message_fields, n_points",
    [
        (1, ["FOO", "BAR"], ["foo", "bar"], [1]),
        (1, ["FOO", "BAR"], ["foo", "bar"], []),
        (1, ["FOO", "BAR"], ["foo"], [1, 2]),
        (1, ["FOO"], ["foo", "bar"], [1, 2]),
    ],
)
def test_mavlink_query_raises_value_error(flight_id, message_types, message_fields, n_points):
    with pytest.raises(ValueError):
        MavLinkTimeseriesQuery(
            flight_id=flight_id,
            message_types=message_types,
            message_fields=message_fields,
            n_points=n_points,
        )

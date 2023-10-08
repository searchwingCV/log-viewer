import random
from datetime import datetime

from domain.mavlink_timeseries.entities import (
    MavLinkFlightMessageProperties,
    MavlinkMessageField,
    MavLinkMessageProperties,
    TimeseriesValues,
)
from infrastructure.db.orm import MavLinkTimeseries as MavLinkTimeseriesModel
from infrastructure.repositories.mavlink_timeseries import MavLinkTimeseriesRepository
from sqlalchemy import insert


def test_bulk_insert(test_db_session, test_mavlink_series, fill_mock_data):
    fill_mock_data()

    repository = MavLinkTimeseriesRepository()

    repository.bulk_insert(test_db_session, 1, test_mavlink_series)

    assert test_db_session.query(MavLinkTimeseriesModel).filter_by(message_field="Bar").count() == 300
    assert test_db_session.query(MavLinkTimeseriesModel).filter_by(message_field="Baz").count() == 300


def test_get_by_flight_type_field(test_db_session, test_mavlink_series, fill_mock_data):
    fill_mock_data()

    repository = MavLinkTimeseriesRepository()

    nb_entries = 20

    values = [random.random() for _ in range(nb_entries)]
    timestamps = [datetime.now() for _ in range(nb_entries)]

    expected_values = [TimeseriesValues(timestamp=timestamps[idx], value=values[idx]) for idx in range(nb_entries)]
    mapping = [
        {
            "flight_id": 1,
            "timestamp": timestamps[idx],
            "message_type": "FOO",
            "message_field": "Bar",
            "value": values[idx],
        }
        for idx in range(nb_entries)
    ]
    test_db_session.execute(insert(MavLinkTimeseriesModel), mapping)

    test_db_session.commit()

    series = repository.get_by_flight_type_field(test_db_session, 1, "FOO", "Bar")

    assert series.flight_id == 1
    assert series.values == expected_values
    assert series.message_type == "FOO"
    assert series.message_field == "Bar"

    series = repository.get_by_flight_type_field(test_db_session, 1, "FOO", "Baz")

    assert series.flight_id == 1
    assert series.values == []
    assert series.message_type == "FOO"
    assert series.message_field == "Baz"

    timestamp_1 = timestamps[10]
    timestamp_2 = timestamps[15]
    series = repository.get_by_flight_type_field(test_db_session, 1, "FOO", "Bar", timestamp_1, timestamp_2)

    assert len(series.values) == 6

    series = repository.get_by_flight_type_field(test_db_session, 1, "FOO", "Bar", timestamp_1, timestamp_2, 3)

    assert len(series.values) == 3


def test_delete_by_flight_id(test_db_session, fill_mock_data):
    fill_mock_data()

    repository = MavLinkTimeseriesRepository()

    nb_entries = 100

    values = [random.random() for _ in range(nb_entries)]
    timestamps = [datetime.now() for _ in range(nb_entries)]

    test_db_session.bulk_insert_mappings(
        MavLinkTimeseriesModel,
        [
            {
                "flight_id": 1,
                "timestamp": timestamps[idx],
                "message_type": "FOO",
                "message_field": "Bar",
                "value": values[idx],
            }
            for idx in range(nb_entries)
        ],
    )

    repository.delete_by_flight_id(test_db_session, 1)

    assert test_db_session.query(MavLinkTimeseriesModel).filter_by(flight_id=1).count() == 0


def test_get_available_messages_by_group(test_db_session, test_mavlink_series, fill_mock_data):
    fill_mock_data()

    nb_entries = 100

    values = [random.random() for _ in range(nb_entries)]
    timestamps = [datetime.now() for _ in range(nb_entries)]

    test_db_session.bulk_insert_mappings(
        MavLinkTimeseriesModel,
        [
            {
                "flight_id": 1,
                "timestamp": timestamps[idx],
                "message_type": random.choice(["FOO", "BAR", "BAZ"]),
                "message_field": random.choice(["foo", "bar", "baz"]),
                "value": values[idx],
            }
            for idx in range(nb_entries)
        ],
    )
    test_db_session.commit()

    repository = MavLinkTimeseriesRepository()

    message_properties = repository.get_available_messages_by_group(test_db_session, 1)

    expected_message_properties = MavLinkFlightMessageProperties(
        flight_id=1,
        message_properties=[
            MavLinkMessageProperties(
                message_type="FOO",
                message_fields=[
                    MavlinkMessageField(name="bar"),
                    MavlinkMessageField(name="baz"),
                    MavlinkMessageField(name="foo"),
                ],
            ),
            MavLinkMessageProperties(
                message_type="BAZ",
                message_fields=[
                    MavlinkMessageField(name="bar"),
                    MavlinkMessageField(name="baz"),
                    MavlinkMessageField(name="foo"),
                ],
            ),
            MavLinkMessageProperties(
                message_type="BAR",
                message_fields=[
                    MavlinkMessageField(name="bar"),
                    MavlinkMessageField(name="baz"),
                    MavlinkMessageField(name="foo"),
                ],
            ),
        ],
    )

    assert message_properties.flight_id == expected_message_properties.flight_id

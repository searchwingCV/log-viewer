import random
from datetime import datetime

from domain.mavlink_timeseries.entities import TimeseriesValues
from infrastructure.db.orm import MavLinkTimeseries as MavLinkTimeseriesModel
from infrastructure.repositories.mavlink_timeseries import MavLinkTimeseriesRepository


def test_bulk_insert(test_db_session, mavlink_series, fill_mock_data):
    fill_mock_data()

    repository = MavLinkTimeseriesRepository()

    repository.bulk_insert(test_db_session, 1, mavlink_series)

    assert test_db_session.query(MavLinkTimeseriesModel).filter_by(message_field="Bar").count() == 300
    assert test_db_session.query(MavLinkTimeseriesModel).filter_by(message_field="Baz").count() == 300


def test_get_by_flight_type_field(test_db_session, mavlink_series, fill_mock_data):
    fill_mock_data()

    repository = MavLinkTimeseriesRepository()

    nb_entries = 100

    values = [random.random() for _ in range(nb_entries)]
    timestamps = [datetime.now() for _ in range(nb_entries)]

    expected_values = [TimeseriesValues(timestamp=timestamps[idx], value=values[idx]) for idx in range(nb_entries)]
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

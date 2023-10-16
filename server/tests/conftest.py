import random
from datetime import datetime

import pytest
from domain.flight_file.value_objects import AllowedFiles
from faker import Faker
from mock_providers import FlightLogProvider
from pymavlog import MavLinkMessageSeries

fake = Faker()
fake.add_provider(FlightLogProvider)


class MockMavLinkMessageSeries(MavLinkMessageSeries):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def __setitem__(self, key, value):
        self._fields[key] = value


@pytest.fixture
def get_sample_drone():
    def _get_sample_drone():
        return fake.drone()

    return _get_sample_drone


@pytest.fixture
def get_sample_mission():
    def _get_sample_mission():
        return fake.mission()

    return _get_sample_mission


@pytest.fixture
def get_sample_flight():
    def _get_sample_flight(drone_id=1, mission_id=None):
        return fake.flight(mission_id=mission_id, drone_id=drone_id)

    return _get_sample_flight


@pytest.fixture
def get_sample_flight_file():
    def _get_sample_flight_file(flight_id=1, file_type=AllowedFiles.log, version=random.randint(1, 10)):
        return fake.flight_file(flight_id, file_type, version)

    return _get_sample_flight_file


@pytest.fixture(scope="function")
def mavlink_series():
    rows = 300
    series = MockMavLinkMessageSeries(name="FOO", columns=["timestamp", "Bar", "Baz"], types=[datetime, int, float])

    series._columns = ["timestamp", "Bar", "Baz"]
    series._types = [datetime, int, float]

    series["timestamp"] = [datetime.now() for _ in range(rows)]
    series["Bar"] = [idx for idx in range(rows)]
    series["Baz"] = [random.random() for _ in range(rows)]

    return series


@pytest.fixture(scope="function")
def get_mock_mavlink_series():
    def wrapper(name="FOO", columns=["Bar", "Baz"], data=[]):
        rows = 300
        data_types = [type(d[0]) for d in data]
        series = MockMavLinkMessageSeries(name=name, columns=columns, types=data_types)

        if not data:
            for c in columns:
                series[c] = np.array([random.random() for _ in range(rows)])
        else:
            for idx, c in enumerate(columns):
                series[c] = np.array(data[idx])
        return series

    return wrapper

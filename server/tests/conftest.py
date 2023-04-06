import random

import pytest
from domain.flight_file.value_objects import AllowedFiles
from faker import Faker
from mock_providers import FlightLogProvider

fake = Faker()
fake.add_provider(FlightLogProvider)


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

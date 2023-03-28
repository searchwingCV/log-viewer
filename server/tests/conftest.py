import pytest
from faker import Faker
from src.domain.drone.entities import BaseDrone

fake = Faker()


@pytest.fixture
def get_sample_drone():
    def _get_sample_drone():
        return BaseDrone(
            name=fake.first_name() + fake.last_name(),
            model=fake.domain_word(),
            sys_thismav=fake.pyint(min_value=1, max_value=3),
        )

    return _get_sample_drone

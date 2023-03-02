import pytest
from faker import Faker
from src.domain.plane.entities import BasePlane

fake = Faker()


@pytest.fixture
def get_sample_plane():
    def _get_sample_plane():
        return BasePlane(alias=fake.first_name() + fake.last_name(), model=fake.domain_word(), in_use=fake.pybool())

    return _get_sample_plane

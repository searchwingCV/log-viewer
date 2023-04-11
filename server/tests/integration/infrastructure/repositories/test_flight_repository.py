import pytest
from common.exceptions.db import ForeignKeyNotFound
from infrastructure.repositories.flight import FlightRepository


def test_upsert_raises_fk_not_found(test_db_session, get_sample_flight):
    data = get_sample_flight(drone_id=1000)
    repository = FlightRepository()
    with pytest.raises(ForeignKeyNotFound):
        repository.upsert(test_db_session, data)

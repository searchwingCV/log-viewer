from copy import deepcopy
from datetime import datetime

import pytest
from common.exceptions.db import DuplicatedKeyError
from domain.drone.entities import Drone, DroneUpdate
from infrastructure.repositories.drone import DroneModel, DroneRepository


def test_upsert_new(test_db_session, get_sample_drone):
    repository = DroneRepository()
    data = get_sample_drone()

    created = repository.upsert(test_db_session, data)

    assert created.name == data.name
    assert created.id is not None
    assert created.model == data.model
    assert created.status == data.status


def test_upsert_new_raises_duplicated_key_error(test_db_session, get_sample_drone):
    existing_drone_data = get_sample_drone()
    existing_drone = DroneModel(**existing_drone_data.dict())
    test_db_session.add(existing_drone)
    test_db_session.commit()

    repository = DroneRepository()
    data = get_sample_drone()
    data.name = existing_drone.name

    with pytest.raises(DuplicatedKeyError):
        repository.upsert(test_db_session, data)


def test_upsert_existing(test_db_session, get_sample_drone):
    existing_drone_data = get_sample_drone()
    existing_drone = DroneModel(**existing_drone_data.dict())

    test_db_session.add(existing_drone)
    test_db_session.commit()

    drones_before = len(test_db_session.query(DroneModel).all())
    new_drone = deepcopy(Drone.from_orm(existing_drone))
    new_drone.name = "Testname"

    repository = DroneRepository()
    new_inserted_drone = repository.upsert(test_db_session, new_drone)

    drones_after = len(test_db_session.query(DroneModel).all())

    assert drones_after == drones_before
    assert new_inserted_drone.name == new_drone.name
    assert new_inserted_drone.updated_at is not None


def test_find_by_id(test_db_session, insert_drones):
    insert_drones(5)

    repository = DroneRepository()
    drone = repository.get_by_id(test_db_session, 2)

    assert drone.id == 2
    assert drone.name is not None


def test_find_by_id_returns_none(test_db_session, insert_drones):
    insert_drones(5)

    repository = DroneRepository()
    drone = repository.get_by_id(test_db_session, 22)

    assert drone is None


def test_delete_by_id(test_db_session, insert_drones):
    insert_drones(5)
    drones_before = len(test_db_session.query(DroneModel).all())
    repository = DroneRepository()

    repository.delete_by_id(test_db_session, 2)

    drones_after = len(test_db_session.query(DroneModel).all())

    assert drones_before - drones_after == 1


def test_get_by_name(test_db_session, get_sample_drone):
    existing_drone_data = get_sample_drone()

    name = existing_drone_data.name
    existing_drone = DroneModel(**existing_drone_data.dict())
    test_db_session.add(existing_drone)
    test_db_session.commit()

    repository = DroneRepository()
    got_drone = repository.get_by_name(test_db_session, name)

    assert existing_drone_data.name == got_drone.name
    assert existing_drone_data.model == got_drone.model
    assert existing_drone_data.status == got_drone.status


@pytest.mark.parametrize(
    ["expected_len", "page", "size"],
    [
        (20, 1, 20),
        (20, 2, 20),
        (3, 3, 20),
        (0, 5, 20),
        (0, 5, 20),
    ],
)
def test_get_with_pagination(test_db_session, insert_drones, expected_len, page, size):
    TOTAL_DRONES = 43

    insert_drones(TOTAL_DRONES)

    repository = DroneRepository()
    total, result = repository.get_with_pagination(test_db_session, page, size)

    assert len(result) == expected_len
    assert total == TOTAL_DRONES


def test_get_with_pagination_filter(test_db_session, insert_drones):
    TOTAL_DRONES = 53

    insert_drones(TOTAL_DRONES)

    query_filter = DroneModel.name.contains("M")
    expected_len = len(test_db_session.query(DroneModel).filter(query_filter).all())
    repository = DroneRepository()
    total, result = repository.get_with_pagination(test_db_session, 1, 50, query_filter)

    assert len(result) == expected_len
    assert total <= TOTAL_DRONES


def test_update(add_sample_drone_to_db, test_db_session):
    add_sample_drone_to_db()
    update_data = DroneUpdate(name="NewName")
    repository = DroneRepository()
    drone_updated = repository.update(test_db_session, 1, update_data)

    assert drone_updated.name == update_data.name

    drone_db = test_db_session.query(DroneModel).filter_by(id=1).first()

    first_updated_at = drone_db.updated_at
    assert drone_db.name == drone_updated.name
    assert drone_db.updated_at is not None

    assert type(drone_updated) == Drone

    update_data = DroneUpdate(name="NewName2")
    drone_updated = repository.update(test_db_session, 1, update_data)
    drone_db = test_db_session.query(DroneModel).filter_by(id=1).first()

    assert drone_updated.name == update_data.name == drone_db.name
    assert drone_updated.updated_at is not None
    assert drone_updated.updated_at > first_updated_at


def test_update_non_existing(add_sample_drone_to_db, test_db_session):
    add_sample_drone_to_db()
    update_data = DroneUpdate(name="NewName")
    repository = DroneRepository()
    drone_updated = repository.update(test_db_session, 2, update_data)

    assert drone_updated is None


def test_get_all_should_be_ordered(add_sample_drone_to_db, get_sample_drone, test_db_session):
    add_sample_drone_to_db()

    drone_2 = get_sample_drone()

    drone_db = DroneModel(**drone_2.dict())
    drone_db.updated_at = datetime.now()

    test_db_session.add(drone_db)
    test_db_session.commit()
    test_db_session.refresh(drone_db)

    add_sample_drone_to_db()

    repository = DroneRepository()
    _, drones = repository.get_with_pagination(test_db_session, 1, 20)

    assert drones[0].id == 1
    assert drones[1].id == 2
    assert drones[2].id == 3


def test_update_with_none(add_sample_drone_to_db, test_db_session):
    add_sample_drone_to_db()
    update_data = DroneUpdate(name="NewName", description=None)
    repository = DroneRepository()
    drone_updated = repository.update(test_db_session, 1, update_data)

    assert drone_updated.name == update_data.name
    assert drone_updated.description is None

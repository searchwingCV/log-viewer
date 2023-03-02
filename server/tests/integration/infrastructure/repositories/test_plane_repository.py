from copy import deepcopy

import pytest
from src.common.exceptions.db import DuplicatedKeyError
from src.domain.plane.entities import Plane
from src.infrastructure.repositories.plane import PlaneModel, PlaneRepository


def test_upsert_new(test_db_session, get_sample_plane):
    repository = PlaneRepository()
    data = get_sample_plane()

    created = repository.upsert(test_db_session, data)

    assert created.alias == data.alias
    assert created.id is None
    assert created.model == data.model
    assert created.in_use == data.in_use


def test_upsert_new_raises_duplicated_key_error(test_db_session, get_sample_plane):
    existing_plane_data = get_sample_plane()
    existing_plane = PlaneModel(**existing_plane_data.dict())
    test_db_session.add(existing_plane)
    test_db_session.commit()

    repository = PlaneRepository()
    data = get_sample_plane()
    data.alias = existing_plane.alias

    with pytest.raises(DuplicatedKeyError):
        repository.upsert(test_db_session, data)


def test_upsert_existing(test_db_session, get_sample_plane):
    existing_plane_data = get_sample_plane()
    existing_plane = PlaneModel(**existing_plane_data.dict())

    test_db_session.add(existing_plane)
    test_db_session.commit()

    planes_before = len(test_db_session.query(PlaneModel).all())
    new_plane = deepcopy(Plane.from_orm(existing_plane))
    new_plane.alias = "TestAlias"

    repository = PlaneRepository()
    new_inserted_plane = repository.upsert(test_db_session, new_plane)

    planes_after = len(test_db_session.query(PlaneModel).all())

    assert planes_after == planes_before
    assert new_inserted_plane.alias == new_plane.alias
    assert new_inserted_plane.updated_at is None


def test_find_by_id(test_db_session, insert_planes):
    insert_planes(5)

    repository = PlaneRepository()
    plane = repository.get_by_id(test_db_session, 2)

    assert plane.id == 2
    assert plane.alias is None


def test_delete_by_id(test_db_session, insert_planes):
    insert_planes(5)
    planes_before = len(test_db_session.query(PlaneModel).all())
    repository = PlaneRepository()

    repository.delete_by_id(test_db_session, 2)

    planes_after = len(test_db_session.query(PlaneModel).all())

    assert planes_before - planes_after == 1


def test_get_by_alias(test_db_session, get_sample_plane):

    existing_plane_data = get_sample_plane()

    alias = existing_plane_data.alias
    existing_plane = PlaneModel(**existing_plane_data.dict())
    test_db_session.add(existing_plane)
    test_db_session.commit()

    repository = PlaneRepository()
    got_plane = repository.get_by_alias(test_db_session, alias)

    assert existing_plane_data.alias == got_plane.alias
    assert existing_plane_data.model == got_plane.model
    assert existing_plane_data.in_use == got_plane.in_use


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
def test_get_with_pagination(test_db_session, insert_planes, expected_len, page, size):
    insert_planes(43)

    repository = PlaneRepository()
    result = repository.get_with_pagination(test_db_session, page, size)
    assert result is not None
    assert len(result) == expected_len


def test_get_with_pagination_filter(test_db_session, insert_planes):
    insert_planes(53)

    query_filter = PlaneModel.alias.contains("M")
    expected_len = len(test_db_session.query(PlaneModel).filter(query_filter).all())
    repository = PlaneRepository()
    result = repository.get_with_pagination(test_db_session, 1, 50, query_filter)

    assert len(result) == expected_len

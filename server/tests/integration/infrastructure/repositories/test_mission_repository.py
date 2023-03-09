from src.domain.mission.entities import BaseMission
from src.infrastructure.db.orm import Mission as MissionModel
from src.infrastructure.repositories.mission import MissionRepository


def test_get_by_alias(test_db_session):

    sample_mision = BaseMission(
        alias="test_mission",
        description="some description",
        location="testLocation",
        latitude=10.0,
        longitude=10.0,
        is_test=True,
    )

    sample_mission_db = MissionModel(**sample_mision.dict())
    test_db_session.add(sample_mission_db)
    test_db_session.commit()

    repository = MissionRepository()
    got_mission = repository.get_by_alias(test_db_session, sample_mision.alias)

    assert sample_mision.alias == got_mission.alias
    assert sample_mision.description == got_mission.description
    assert sample_mision.is_test == got_mission.is_test
    assert sample_mision.location == got_mission.location
    assert sample_mision.latitude == got_mission.latitude
    assert sample_mision.longitude == got_mission.longitude


def test_get_by_alias_returns_none(test_db_session):

    sample_mision = BaseMission(
        alias="test_mission",
        description="some description",
        location="testLocation",
        latitude=10.0,
        longitude=10.0,
        is_test=True,
    )

    sample_mission_db = MissionModel(**sample_mision.dict())
    test_db_session.add(sample_mission_db)
    test_db_session.commit()

    repository = MissionRepository()
    got_mission = repository.get_by_alias(test_db_session, "some_alias")

    assert got_mission is None

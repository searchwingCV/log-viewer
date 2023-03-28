from datetime import date

from src.domain.mission.entities import BaseMission
from src.infrastructure.db.orm import Mission as MissionModel
from src.infrastructure.repositories.mission import MissionRepository


def test_get_by_name(test_db_session):

    sample_mision = BaseMission(
        name="test_mission",
        description="some description",
        location="testLocation",
        start_date=date.today(),
        end_date=date.today(),
        partner_organization="Sea Watch",
    )

    sample_mission_db = MissionModel(**sample_mision.dict())
    test_db_session.add(sample_mission_db)
    test_db_session.commit()

    repository = MissionRepository()
    got_mission = repository.get_by_name(test_db_session, sample_mision.name)

    assert sample_mision.name == got_mission.name
    assert sample_mision.description == got_mission.description
    assert sample_mision.location == got_mission.location
    assert sample_mision.partner_organization == got_mission.partner_organization


def test_get_by_namne_returns_none(test_db_session):

    sample_mision = BaseMission(
        name="test_mission",
        description="some description",
        location="testLocation",
        start_date=date.today(),
        end_date=date.today(),
        partner_organization="Sea Watch",
    )

    sample_mission_db = MissionModel(**sample_mision.dict())
    test_db_session.add(sample_mission_db)
    test_db_session.commit()

    repository = MissionRepository()
    got_mission = repository.get_by_name(test_db_session, "some_name")

    assert got_mission is None

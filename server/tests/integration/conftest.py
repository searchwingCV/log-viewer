import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.common.config import TestConfig
from src.infrastructure.db.orm import Base, Drone


@pytest.fixture
def test_db_session():

    engine = create_engine(TestConfig.SQLALCHEMY_DATABASE_URI)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def insert_drones(test_db_session, get_sample_drone):
    def _insert_drones(number=10):
        for _ in range(number):
            drone = Drone(**get_sample_drone().dict())
            test_db_session.add(drone)
            test_db_session.commit()
            test_db_session.refresh(drone)

    return _insert_drones

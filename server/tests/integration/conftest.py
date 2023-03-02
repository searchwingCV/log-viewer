import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.common.config import TestConfig
from src.infrastructure.db.orm import Base, Plane


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
def insert_planes(test_db_session, get_sample_plane):
    def _insert_planes(number=10):
        for _ in range(number):
            plane = Plane(**get_sample_plane().dict())
            test_db_session.add(plane)
            test_db_session.commit()
            test_db_session.refresh(plane)

    return _insert_planes

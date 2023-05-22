import random
from datetime import datetime

import pytest
from common.config import TestConfig
from domain.flight_file.value_objects import AllowedFiles
from infrastructure.db.orm import Base, Drone, Flight, FlightFile, Mission
from pymavlog import MavLinkMessageSeries
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


class MockMavLinkMessageSeries(MavLinkMessageSeries):
    def __setitem__(self, key, value):
        self._fields[key] = value


@pytest.fixture(scope="function")
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
    def wrapper(number=10):
        for _ in range(number):
            drone = Drone(**get_sample_drone().dict())
            test_db_session.add(drone)
            test_db_session.commit()
            test_db_session.refresh(drone)

    return wrapper


@pytest.fixture
def insert_flights(test_db_session, get_sample_flight):
    def wrapper(nb_drones, nb_flights, nb_missions):
        for _ in range(nb_flights):
            flight = Flight(
                **get_sample_flight(
                    drone_id=random.randint(1, nb_drones),
                    mission_id=random.choice([None, random.randint(1, nb_missions)]),
                ).dict()
            )
            test_db_session.add(flight)
            test_db_session.commit()
            test_db_session.refresh(flight)

    return wrapper


@pytest.fixture
def insert_missions(test_db_session, get_sample_mission):
    def wrapper(nb_missions):
        for _ in range(nb_missions):
            mission = Mission(**get_sample_mission().dict())
            test_db_session.add(mission)
            test_db_session.commit()
            test_db_session.refresh(mission)

    return wrapper


@pytest.fixture
def insert_flight_files(test_db_session, get_sample_flight_file):
    def wrapper(nb_flights, chances_missing_file, allowed_files):
        for flight_id in range(1, nb_flights + 1):
            for file_type in allowed_files:
                # simulate that some flights do not contain one or more files
                if random.random() < chances_missing_file:
                    continue
                flight_file = FlightFile(**get_sample_flight_file(flight_id, file_type).dict())
                test_db_session.add(flight_file)
                test_db_session.commit()
                test_db_session.refresh(flight_file)

    return wrapper


@pytest.fixture
def fill_mock_data(insert_flights, insert_drones, insert_missions, insert_flight_files):
    def _fill_mock_data(
        nb_drones=10,
        nb_flights=40,
        nb_missions=5,
        chances_missing_file=0.15,
        allowed_files=[AllowedFiles.apm, AllowedFiles.log, AllowedFiles.rosbag, AllowedFiles.tlog],
    ):
        insert_drones(nb_drones)
        insert_missions(nb_missions)
        insert_flights(nb_drones, nb_flights, nb_missions)
        insert_flight_files(nb_flights, chances_missing_file, allowed_files)

    return _fill_mock_data


@pytest.fixture(scope="function")
def add_sample_drone_to_db(test_db_session, get_sample_drone):
    def wrapper():
        drone = get_sample_drone()
        drone_db = Drone(**drone.dict())
        test_db_session.add(drone_db)
        test_db_session.commit()
        test_db_session.refresh(drone_db)

    return wrapper


@pytest.fixture(scope="function")
def mavlink_series():
    rows = 300
    series = MockMavLinkMessageSeries(name="FOO", columns=["timestamp", "Bar", "Baz"], types=[datetime, int, float])

    series["timestamp"] = [datetime.now() for _ in range(rows)]
    series["Bar"] = [idx for idx in range(rows)]
    series["Baz"] = [random.random() for _ in range(rows)]

    return series

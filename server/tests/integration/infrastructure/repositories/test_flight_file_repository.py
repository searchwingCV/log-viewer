import pytest
from domain.flight_file.entities import BaseFlightFile, FlightFile
from domain.flight_file.value_objects import AllowedFiles
from infrastructure.db.orm import FlightFile as FlightFileModel
from infrastructure.repositories import FlightFileRepository


@pytest.fixture
def add_data(test_db_session):
    def wrapper(file_type, flight_id, filename):
        path = f"{flight_id}/{file_type}/{filename}"
        sample_file = BaseFlightFile(file_type=file_type, fk_flight=flight_id, location=path)
        sample_file_db = FlightFile(**sample_file.dict())
        test_db_session.add(sample_file_db)
        test_db_session.commit()

    return wrapper


def test_get_by_flight(fill_mock_data, test_db_session):
    allowed_files = [
        AllowedFiles.apm,
        AllowedFiles.log,
        AllowedFiles.rosbag,
        AllowedFiles.tlog,
    ]
    fill_mock_data(nb_flights=10, chances_missing_file=0, allowed_files=allowed_files)
    repository = FlightFileRepository()
    flight_files = repository.get_by_flight(1, test_db_session)
    assert len(flight_files) == len(allowed_files)
    assert all([isinstance(flight_file, FlightFile) for flight_file in flight_files])


def test_get_by_flight_does_not_exist(fill_mock_data, test_db_session):
    allowed_files = [
        AllowedFiles.apm,
        AllowedFiles.log,
        AllowedFiles.rosbag,
        AllowedFiles.tlog,
    ]
    fill_mock_data(nb_flights=10, chances_missing_file=1, allowed_files=allowed_files)
    repository = FlightFileRepository()
    flight_files = repository.get_by_flight(1, test_db_session)
    assert flight_files == []


@pytest.mark.parametrize(
    ["flight_id", "should_return_none", "file_type"],
    [
        (1, True, AllowedFiles.tlog),
        (1, False, AllowedFiles.log),
        (40, True, AllowedFiles.log),
    ],
)
def test_get_by_flight_and_type(fill_mock_data, test_db_session, flight_id, should_return_none, file_type):
    allowed_files = [AllowedFiles.apm, AllowedFiles.log, AllowedFiles.rosbag]

    fill_mock_data(nb_flights=10, chances_missing_file=0, allowed_files=allowed_files)

    repository = FlightFileRepository()
    flight_file = repository.get_by_flight_and_type(flight_id, file_type, test_db_session)
    assert (flight_file is None) == should_return_none


def test_delete_by_flight_id(fill_mock_data, test_db_session):
    fill_mock_data(nb_flights=10, chances_missing_file=0)
    flight_id = 1

    repository = FlightFileRepository()
    repository.delete_by_flight_id(test_db_session, flight_id)
    assert test_db_session.query(FlightFileModel).filter_by(fk_flight=flight_id).count() == 0

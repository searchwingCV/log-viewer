from datetime import datetime
from io import BytesIO
from unittest.mock import Mock

import pytest
from application.services.file import FileService
from common.exceptions.db import NotFoundException
from domain.flight.entities import Flight
from domain.flight_file.entities import BaseFlightFile, FlightFile
from domain.flight_file.value_objects import AllowedFiles
from fastapi import UploadFile
from infrastructure.repositories import FlightFileRepository, FlightRepository
from infrastructure.storage import Storage


@pytest.fixture
def mock_flight_repository():
    mock_flight_repository = Mock(spec=FlightRepository)
    return mock_flight_repository


@pytest.fixture
def mock_file_repository():
    mock_file_repository = Mock(spec=FlightFileRepository)
    return mock_file_repository


@pytest.fixture
def mock_storage():
    mock_storage = Mock(spec=Storage)
    return mock_storage


@pytest.fixture
def mock_upload():
    mock_upload = Mock(spec=UploadFile)
    mock_upload.filename = "foo.log"
    mock_upload.file = BytesIO(b"bar")
    return mock_upload


def test_upload_file_new(
    mock_file_repository,
    mock_storage,
    mock_session_factory,
    mock_flight_repository,
    mock_upload,
    get_sample_flight,
):
    flight_id = 1
    file_type = AllowedFiles.log
    flight = Flight(id=flight_id, created_at=datetime.now(), **get_sample_flight().dict())

    mock_flight_repository.get_by_id.side_effect = [flight]
    mock_file_repository.get_by_flight_and_type.side_effect = [None]

    file_service = FileService(
        repository=mock_file_repository,
        flight_repository=mock_flight_repository,
        storage=mock_storage,
        session=mock_session_factory,
    )

    file_service.upload_file(flight_id=flight_id, file=mock_upload, file_type=file_type)

    expected_file = BaseFlightFile(
        location=f"{flight_id}/{file_type}/{mock_upload.filename}",
        file_type=file_type,
        fk_flight=flight_id,
        version=1,
    )

    mock_file_repository.upsert.assert_called_once()
    mock_file_repository.upsert.assert_called_with(session=mock_session_factory.__enter__(), data=expected_file)
    mock_storage.delete.assert_not_called()
    mock_storage.save.assert_called_once()


def test_upload_file_file_does_not_exist(
    mock_file_repository,
    mock_storage,
    mock_session_factory,
    mock_flight_repository,
    mock_upload,
):

    file_type = AllowedFiles.log

    mock_flight_repository.get_by_id.side_effect = [None]
    mock_file_repository.get_by_flight_and_type.side_effect = [None]

    file_service = FileService(
        repository=mock_file_repository,
        flight_repository=mock_flight_repository,
        storage=mock_storage,
        session=mock_session_factory,
    )
    with pytest.raises(NotFoundException):
        file_service.upload_file(flight_id=10, file=mock_upload, file_type=file_type)


def test_upload_file_exists_same_path(
    mock_file_repository,
    mock_storage,
    mock_session_factory,
    mock_flight_repository,
    mock_upload,
    get_sample_flight,
):
    flight_id = 1
    flight_file_id = 1
    file_type = AllowedFiles.log
    flight_file = FlightFile(
        id=flight_file_id,
        created_at=datetime.now(),
        location=f"{flight_id}/{file_type}/{mock_upload.filename}",
        file_type=file_type,
        fk_flight=flight_id,
        version=1,
    )
    flight = Flight(id=flight_id, created_at=datetime.now(), **get_sample_flight().dict())

    mock_flight_repository.get_by_id.side_effect = [flight]
    mock_file_repository.get_by_flight_and_type.side_effect = [flight_file]

    file_service = FileService(
        repository=mock_file_repository,
        flight_repository=mock_flight_repository,
        storage=mock_storage,
        session=mock_session_factory,
    )

    file_service.upload_file(flight_id=flight_id, file=mock_upload, file_type=file_type)

    expected_file = flight_file
    expected_file.version = 2

    mock_file_repository.upsert.assert_called_once()
    mock_file_repository.upsert.assert_called_with(session=mock_session_factory.__enter__(), data=expected_file)
    mock_storage.delete.assert_not_called()
    mock_storage.save.assert_called_once()


def test_upload_file_exists_other_path(
    mock_file_repository,
    mock_storage,
    mock_session_factory,
    mock_flight_repository,
    mock_upload,
    get_sample_flight,
):
    flight_id = 1
    flight_file_id = 1
    file_type = AllowedFiles.log
    flight_file = FlightFile(
        id=flight_file_id,
        created_at=datetime.now(),
        location=f"{flight_id}/{file_type}/{mock_upload.filename}",
        file_type=file_type,
        fk_flight=flight_id,
        version=1,
    )
    flight = Flight(id=flight_id, created_at=datetime.now(), **get_sample_flight().dict())

    mock_flight_repository.get_by_id.side_effect = [flight]
    mock_file_repository.get_by_flight_and_type.side_effect = [flight_file]

    file_service = FileService(
        repository=mock_file_repository,
        flight_repository=mock_flight_repository,
        storage=mock_storage,
        session=mock_session_factory,
    )

    # different path should trigger deleting previous path

    mock_upload.filename = "foobar.log"
    file_service.upload_file(flight_id=flight_id, file=mock_upload, file_type=file_type)

    expected_file = flight_file
    expected_file.version = 2

    mock_file_repository.upsert.assert_called_once()
    mock_file_repository.upsert.assert_called_with(session=mock_session_factory.__enter__(), data=expected_file)
    mock_storage.delete.assert_called_once()
    mock_storage.delete.assert_called_with("1/log/foo.log")
    mock_storage.save.assert_called_once()


def test_list_all_files(mock_file_repository, mock_storage, mock_session_factory, mock_flight_repository):
    file_service = FileService(
        repository=mock_file_repository,
        flight_repository=mock_flight_repository,
        storage=mock_storage,
        session=mock_session_factory,
    )
    flight_id = 1
    file_service.list_all_files(flight_id=flight_id)
    mock_file_repository.get_by_flight.assert_called_once()
    mock_file_repository.get_by_flight.assert_called_with(flight_id, mock_session_factory.__enter__())


def test_delete_file_exists(
    mock_file_repository, mock_storage, mock_session_factory, mock_flight_repository, mock_upload
):
    file_service = FileService(
        repository=mock_file_repository,
        flight_repository=mock_flight_repository,
        storage=mock_storage,
        session=mock_session_factory,
    )
    flight_id = 1
    file_id = 1
    file_type = AllowedFiles.log
    flight_file = FlightFile(
        id=file_id,
        created_at=datetime.now(),
        location=f"{flight_id}/{file_type}/{mock_upload.filename}",
        file_type=file_type,
        fk_flight=flight_id,
        version=1,
    )
    mock_file_repository.get_by_id.side_effect = [flight_file]

    file_service.delete_file(file_id=file_id)

    mock_file_repository.delete_by_id.assert_called_once()
    mock_file_repository.delete_by_id.assert_called_with(mock_session_factory.__enter__(), file_id)

    mock_storage.delete.assert_called_once()


def test_delete_file_not_exists(
    mock_file_repository,
    mock_storage,
    mock_session_factory,
    mock_flight_repository,
):
    file_service = FileService(
        repository=mock_file_repository,
        flight_repository=mock_flight_repository,
        storage=mock_storage,
        session=mock_session_factory,
    )
    file_id = 1

    mock_file_repository.get_by_id.side_effect = [None]

    file_service.delete_file(file_id=file_id)

    mock_file_repository.delete_by_id.assert_not_called()

    mock_storage.delete.assert_not_called()

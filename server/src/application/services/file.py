from io import BytesIO
from typing import List

from application.services.base import BaseCRUDService
from common.exceptions.db import NotFoundException
from common.logging import get_logger
from domain import ID_Type
from domain.flight_file.entities import BaseFlightFile, FlightFile, IOFile
from domain.flight_file.value_objects import AllowedFiles
from fastapi import UploadFile
from infrastructure.db.session import SessionContextManager
from infrastructure.repositories import FlightFileRepository, FlightRepository
from infrastructure.storage import Storage

logger = get_logger(__name__)


class FileService(BaseCRUDService):
    _entity = FlightFile
    _entity_type = "FlightFile"

    def __init__(
        self,
        repository: FlightFileRepository,
        flight_repository: FlightRepository,
        storage: Storage,
        session: SessionContextManager = SessionContextManager(),
    ):
        self._storage = storage
        self._repository = repository
        self._flight_repository = flight_repository
        self._session = session

    def __upload_binary_file(self, fileio: BytesIO, path: str) -> None:
        self._storage.save(fileio, path)

    def __delete_binary_file(self, path: str) -> None:
        self._storage.delete(path)

    def get_file(self, id: ID_Type) -> IOFile:
        with self._session as session:
            flight_file: FlightFile = self._repository.get_by_id(session, id, raise_not_found_exc=True)
        buffer = self._storage.get(flight_file.location)
        iofile = IOFile(flight_file=flight_file, io=buffer)
        return iofile

    def upload_file(self, flight_id: ID_Type, file: UploadFile, file_type: AllowedFiles) -> FlightFile:
        with self._session as session:
            if not self._flight_repository.get_by_id(session, flight_id):
                raise NotFoundException(flight_id, self._flight_repository._entity)
        flight_file = self.__get_flight_file(flight_id, file.filename, file_type)
        file_stream = BytesIO(file.file.read())
        self.__upload_binary_file(file_stream, flight_file.location)
        return flight_file

    def __get_flight_file(self, flight_id: ID_Type, filename: str, file_type: AllowedFiles) -> BaseFlightFile:
        # check if file exists - if not create a new entity

        path = f"{flight_id}/{file_type}/{filename}"
        with self._session as session:
            flight_file = self._repository.get_by_flight_and_type(flight_id, file_type, session)
        if flight_file is None:
            flight_file = BaseFlightFile(file_type=file_type, fk_flight=flight_id, location=path)
        else:
            flight_file.version += 1

            # if the filename has changed, remove the previous file and update

            if flight_file.location != path:
                self._storage.delete(flight_file.location)
                flight_file.location = path
        with self._session as session:
            flight_file = self._repository.upsert(session=session, data=flight_file)
        return flight_file

    def delete_file(self, file_id: ID_Type):
        flight_file = self._repository.get_by_id(file_id)
        if flight_file is not None:
            self.__delete_binary_file(flight_file.location)
            with self._session as session:
                self._repository.delete_by_id(session, file_id)
        else:
            pass

    def list_all_files(self, flight_id: ID_Type) -> List[FlightFile]:
        with self._session as session:
            data = self._repository.get_by_flight(flight_id, session)
        return data

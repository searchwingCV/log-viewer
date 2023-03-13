from io import BytesIO
from typing import List

from application.services.base import BaseCRUDService
from common.logging import get_logger
from domain import ID_Type
from domain.flight_file.entities import BaseFlightFile, FlightFile
from domain.flight_file.value_objects import AllowedFiles
from fastapi import UploadFile
from infrastructure.db.session import SessionContextManager
from infrastructure.repositories import FlightFileRepository
from infrastructure.storage import Storage

logger = get_logger(__name__)


class FileService(BaseCRUDService):
    _entity = FlightFile

    def __init__(
        self,
        repository: FlightFileRepository,
        storage: Storage,
        session: SessionContextManager = SessionContextManager(),
    ):
        self._storage = storage
        self._repository = repository
        self._session = session

    def __upload_binary_file(self, fileio: BytesIO, path: str) -> None:
        self._storage.save(fileio, path)

    def __delete_binary_file(self, path: str) -> None:
        self._storage.delete(path)

    def upload_file(self, flight_id: ID_Type, file: UploadFile, file_type: AllowedFiles) -> FlightFile:
        base_file = self.__get_flight_file(flight_id, file.filename, file_type)
        file_stream = BytesIO(file.file.read())
        self.__upload_binary_file(file_stream, base_file.location)
        with self._session as session:
            flight_file = self._repository.upsert(session=session, data=base_file)
        return flight_file

    def __get_flight_file(self, flight_id: ID_Type, filename: str, file_type: AllowedFiles) -> BaseFlightFile:
        path = f"{flight_id}/{file_type}/{filename}"
        return BaseFlightFile(file_type=file_type, fk_flight=flight_id, location=path)

    def delete_file(self, file_id: ID_Type):
        flight_file = self._repository.get_by_id(file_id)
        if flight_file is not None:
            self.__delete_binary_file(flight_file.location)
            self._repository.delete_by_id(file_id)
        else:
            pass

    def list_all_files(self, flight_id: ID_Type) -> List[FlightFile]:
        with self._session as session:
            data = self._repository.get_by_flight(flight_id, session)
        return data

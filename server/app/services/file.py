from io import BytesIO

from app.constants import ALLOWED_FILES
from app.internal.encryption import encrypt
from app.internal.logging import get_logger
from app.internal.storage import Storage
from app.models.metadata import APMParameterFile, Base, LogFile, RosBagFile, TelemetryFile
from app.schemas.file import BaseFileDownload, BaseFileList, FileUploadResponse, FlightFilesList
from fastapi import UploadFile
from sqlalchemy.orm import Session

logger = get_logger(__name__)


class FileService:
    def __init__(self):
        self.log_file_model = LogFile
        self.telemetry_file_model = TelemetryFile
        self.rosbag_file_model = RosBagFile
        self.apm_parameter_file_model = APMParameterFile
        self.base_file_download_serializer = BaseFileDownload
        self.base_file_list_serializer = BaseFileList
        self.file_upload_serializer = FileUploadResponse
        self.list_files_serializer = FlightFilesList
        self.model_mapping = self._get_model_mapping()
        self.__allowed_files = ALLOWED_FILES

    def _get_model_mapping(self):
        return {
            "log": self.log_file_model,
            "tlog": self.telemetry_file_model,
            "rosbag": self.rosbag_file_model,
            "apm": self.apm_parameter_file_model,
        }

    def upload_log_file(self, flight_id: int, storage: Storage, file: UploadFile, db: Session) -> FileUploadResponse:
        return self.__upload_file(flight_id, storage, file, db, "log")

    def upload_tlog_file(self, flight_id: int, storage: Storage, file: UploadFile, db: Session) -> FileUploadResponse:
        return self.__upload_file(flight_id, storage, file, db, "tlog")

    def upload_rosbag_file(self, flight_id: int, storage: Storage, file: UploadFile, db: Session) -> FileUploadResponse:
        return self.__upload_file(flight_id, storage, file, db, "rosbag")

    def upload_apm_param_file(
        self, flight_id: int, storage: Storage, file: UploadFile, db: Session
    ) -> FileUploadResponse:
        self.__upload_file(flight_id, storage, file, db, "apm")

    def delete_apm_param_file(self, file_id: int, storage: Storage, db: Session) -> None:
        return self.__delete_file(file_id, storage, db, "apm")

    def delete_log_file(self, file_id: int, storage: Storage, db: Session) -> None:
        self.__delete_file(file_id, storage, db, "log")

    def delete_tlog_file(self, file_id: int, storage: Storage, db: Session) -> None:
        self.__delete_file(file_id, storage, db, "tlog")

    def delete_rosbag_file(self, file_id: int, storage: Storage, db: Session) -> None:
        self.__delete_file(file_id, storage, db, "rosbag")

    def __delete_file(self, file_id: int, storage: Storage, db: Session, file_type: str):
        file_db = db.query(self.model_mapping.get(file_type)).filter_by(file_id=file_id).first()
        if file_db is not None:
            db.delete(file_db)
            uri = file_db.file_uri
            db.commit()
            path = storage.get_path(uri)
            storage.fs.rm_file(path)
        else:
            pass

    def __upload_file(self, flight_id: str, storage: Storage, file: UploadFile, db: Session, file_type: str):
        try:
            db_model = self.model_mapping.get(file_type)
            path = f"{file_type}/{flight_id}/{file.filename}"
            uri = storage.get_uri(path)
            file_db = self.__add_or_update_db(flight_id, db, db_model, uri)
            file_stream = file.file.read()
            storage.save(BytesIO(file_stream), path)
            db.commit()
        except Exception as err:
            db.rollback()
            logger.exception("Exception detected!")
            raise err
        return FileUploadResponse(
            msg="File was uploaded succesfully",
            file_type=file_type,
            file_id=file_db.file_id,
            file_uri=file_db.file_uri,
            created_at=file_db.created_at,
            updated_at=file_db.updated_at,
        )

    def __add_or_update_db(self, flight_id: int, db: Session, db_model: Base, uri: str):
        file_db = db.query(db_model).filter_by(file_uri=uri).first()
        if file_db is None:
            file_db = db_model(flight_id=flight_id, file_uri=uri)
            db.add(file_db)
        else:
            file_db.version += 1
        return file_db

    def list_all_files(self, flight_id: int, db: Session, base_url: str):
        all_files = self.list_files_serializer(flight_id=flight_id)
        for file_type in self.__allowed_files:
            all_files.__setattr__(file_type, self.__get_files_by_type(flight_id, db, base_url, file_type))
        return all_files

    def __get_files_by_type(self, flight_id: int, db: Session, base_url: str, file_type: str):
        files_db = db.query(self.model_mapping.get(file_type)).filter_by(flight_id=flight_id).all()
        if files_db:
            try:
                files = [
                    self.base_file_download_serializer(
                        file_id=file_db.file_id,
                        download_link=f"{base_url}file/{encrypt(file_db.file_uri)}",
                    )
                    for file_db in files_db
                ]
                file_list = self.base_file_list_serializer(flight_id=flight_id, count=len(files), data=files)
            except Exception as err:
                db.rollback()
                logger.exception("Exception detected!")
                raise err
            return file_list
        else:
            return self.base_file_list_serializer(flight_id=flight_id, count=0, data=[])

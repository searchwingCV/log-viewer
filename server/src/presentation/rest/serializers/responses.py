from abc import ABC
from typing import Generic, List, Sequence, TypeVar

from domain.flight_file.entities import FlightFile
from domain.flight_file.value_objects import AllowedFiles
from presentation.rest.serializers import APISerializer
from presentation.rest.serializers.errors import UnprocessableEntityError
from pydantic import Field
from pydantic.generics import GenericModel

T = TypeVar("T")


class BatchUpdateResponse(GenericModel, Generic[T], ABC):
    success: bool = Field(default=True)
    items: Sequence[T]
    errors: List[UnprocessableEntityError] = Field(default=[])

    def set_success(self):
        if self.errors:
            self.success = False


class FileUploadResponse(APISerializer, FlightFile):
    pass


class FileDownloadResponse(APISerializer):
    id: int
    download_link: str

    @classmethod
    def build_from_record(cls, record: FlightFile, base_url: str):
        download_link = f"{base_url}file/{record.id}"
        return cls(id=record.id, download_link=download_link)


class FileListResponse(APISerializer):
    count: int = Field(default=0)
    data: List[FileDownloadResponse] = Field(default=[])

    class Config:
        orm_mode = True
        allow_population_by_field_name = True

    def add(self, file_download: FileDownloadResponse):
        self.count += 1
        self.data.append(file_download)


class FlightFilesListResponse(APISerializer):
    flight_id: int
    log: FileListResponse
    tlog: FileListResponse
    rosbag: FileListResponse
    apm: FileListResponse

    @classmethod
    def build_from_records(cls, records: List[FlightFile], flight_id: int, base_url: str):
        log = FileListResponse()
        apm = FileListResponse()
        tlog = FileListResponse()
        rosbag = FileListResponse()

        for record in records:
            match record.file_type:
                case AllowedFiles.log:
                    log.add(FileDownloadResponse.build_from_record(record, base_url))
                case AllowedFiles.tlog:
                    tlog.add(FileDownloadResponse.build_from_record(record, base_url))
                case AllowedFiles.apm:
                    apm.add(FileDownloadResponse.build_from_record(record, base_url))
                case AllowedFiles.rosbag:
                    rosbag.add(FileDownloadResponse.build_from_record(record, base_url))
                case _:
                    raise ValueError(f"Unsupported file type -> {record.file_type}")
        return cls(flight_id=flight_id, log=log, tlog=tlog, apm=apm, rosbag=rosbag)

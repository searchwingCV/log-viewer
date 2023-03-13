from typing import List

from common.encryption import encrypt
from domain import EntityID
from domain.flight.entities import Flight
from domain.flight_file.entities import FlightFile
from domain.flight_file.value_objects import AllowedFiles
from domain.flight.entities import FlightUpdate as IFlightUpdate
from domain.flight.entities import IBaseFlight
from presentation.rest.serializers import APISerializer
from pydantic import Field


class CreateFlightSerializer(IBaseFlight, APISerializer):
    pass


class FlightSerializer(Flight, APISerializer):
    pass


class FlightUpdate(IFlightUpdate, EntityID, APISerializer):
    pass


class FileUploadResponse(APISerializer, FlightFile):
    pass


class FileDownloadResponse(APISerializer):
    id: int
    download_link: str

    @classmethod
    def build_from_record(cls, record: FlightFile, base_url: str):
        download_link = f"{base_url}file/{encrypt(record.location)}"
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

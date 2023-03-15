from typing import List

from domain.flight.entities import BaseFlight, Flight, FlightFile
from presentation.rest.serializers import APISerializer


class CreateFlightSerializer(BaseFlight, APISerializer):
    pass


class FlightSerializer(Flight, APISerializer):
    pass


class FlightDeletion(APISerializer):
    msg: str
    flight_id: int


class FileUploadResponse(APISerializer, FlightFile):
    pass


class FileDownloadResponse(APISerializer):
    file_id: int
    download_link: str


class FileListResponse(APISerializer):
    count: int
    data: List[FileDownloadResponse]

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class FlightFilesListResponse(APISerializer):
    flight_id: int
    log: FileListResponse
    tlog: FileListResponse
    rosbag: FileListResponse
    apm: FileListResponse

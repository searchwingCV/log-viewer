from typing import List

from domain import EntityID
from domain.flight.entities import Flight, FlightFile
from domain.flight.entities import FlightUpdate as IFlightUpdate
from domain.flight.entities import IBaseFlight
from presentation.rest.serializers import APISerializer


class CreateFlightSerializer(IBaseFlight, APISerializer):
    pass


class FlightSerializer(Flight, APISerializer):
    pass


class FlightUpdate(IFlightUpdate, EntityID, APISerializer):
    pass


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

from typing import List

from pydantic import BaseModel, Field


class FileUploadResponse(BaseModel):
    msg: str
    file_type: str = Field(alias="fileType")
    file_id: int = Field(alias="logFileId")
    file_uri: str = Field(alias="fileUri")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class BaseFileDownload(BaseModel):
    file_id: int = Field(alias="fileId")
    download_link: str = Field(alias="downloadLink")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class BaseFileList(BaseModel):
    count: int
    data: List[BaseFileDownload]

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class FlightFilesList(BaseModel):
    flight_id: int = Field(alias="flightId")
    log: BaseFileList = Field(alias="logFiles", default=[])
    tlog: BaseFileList = Field(alias="tLogFiles", default=[])

    class Config:
        orm_mode = True
        allow_population_by_field_name = True

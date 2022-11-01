from typing import List

from pydantic import BaseModel, Field


class LogFileUploadResponse(BaseModel):
    msg: str
    log_file_id: int = Field(alias="logFileId")
    file_uri: str = Field(alias="fileUri")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class LogFileDownload(BaseModel):
    log_file_id: int = Field(alias="logFileId")
    download_link: str = Field(alias="downloadLink")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class FlightLogFiles(BaseModel):
    flight_id: int = Field(alias="flightId")
    count: int
    data: List[LogFileDownload]

    class Config:
        orm_mode = True
        allow_population_by_field_name = True

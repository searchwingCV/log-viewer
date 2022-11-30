from datetime import datetime
from typing import List, Union

from pydantic import BaseModel, Field


class FileUploadResponse(BaseModel):
    msg: str
    file_type: str = Field(alias="fileType")
    file_id: int = Field(alias="logFileId")
    file_uri: str = Field(alias="fileUri")
    updated_at: Union[None, datetime] = Field(alias="updatedAt")
    created_at: datetime = Field(alias="createdAt")

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
    rosbag: BaseFileList = Field(alias="rosBagFiles", default=[])
    apm: BaseFileList = Field(alias="apmParamFiles", default=[])

    class Config:
        orm_mode = True
        allow_population_by_field_name = True

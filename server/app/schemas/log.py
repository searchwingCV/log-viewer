from typing import Optional

from pydantic import BaseModel, Field


class UploadLogFileSchema(BaseModel):
    file_id: Optional[str] = Field(alias="fileId")
    flight_id: str = Field(alias="flightId")

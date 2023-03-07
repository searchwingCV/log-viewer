from datetime import datetime
from typing import Union

from domain.types import ID_Type
from pydantic import BaseModel


class DomainEntity(BaseModel):
    class Config:
        orm_mode = True

    id: ID_Type
    created_at: datetime
    updated_at: Union[datetime, None]

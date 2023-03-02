from datetime import datetime
from typing import Optional

from domain.types import ID_Type
from pydantic import BaseModel


class DomainEntity(BaseModel):
    class Config:
        orm_mode = True

    id: Optional[ID_Type]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

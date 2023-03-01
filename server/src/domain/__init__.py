from datetime import datetime
from typing import Optional

from domain.types import ID_Type
from pydantic import BaseModel


class DomainEntity(BaseModel):
    id: ID_Type
    created_at: datetime
    updated_at: Optional[datetime]

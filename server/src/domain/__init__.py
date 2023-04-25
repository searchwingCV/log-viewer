from datetime import datetime
from typing import List, Optional, Union

from domain.types import ID_Type
from pydantic import BaseModel
from pydantic.main import ModelMetaclass


class DomainEntity(BaseModel):
    class Config:
        orm_mode = True

    id: ID_Type
    created_at: datetime
    updated_at: Union[datetime, None]


class AllOptional(ModelMetaclass):
    def __new__(cls, name, bases, namespaces, **kwargs):
        annotations = namespaces.get("__annotations__", {})
        for base in bases:
            annotations.update(base.__annotations__)
        for field in annotations:
            if not field.startswith("__") and field != "id":
                annotations[field] = Optional[annotations[field]]
        namespaces["__annotations__"] = annotations
        return super().__new__(cls, name, bases, namespaces, **kwargs)


class DomainUpdate(BaseModel, metaclass=AllOptional):
    _to_delete: List[str] = []

    def __init__(self, *args, **kwargs):
        for k, v in kwargs.items():
            if v is None:
                self._to_delete.append(k)
        super().__init__(*args, **kwargs)


class EntityID(BaseModel):
    id: ID_Type

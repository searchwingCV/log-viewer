from typing import TypeVar

from pydantic import BaseModel

T_Model = TypeVar("T_Model", bound=BaseModel)
ID_Type = int

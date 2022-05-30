from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel


class BaseSchema(BaseModel):
    def to_json(self, **kwargs):
        return jsonable_encoder(self, **kwargs)


class BasePageResponse(BaseSchema):
    total: int = 0
    next: str = ""
    previous: str = ""
    page: int = 0
    size: int = 20

from pydantic import Field
from src.schemas.base import BaseSchema


class AppHealth(BaseSchema):
    api_healthy: bool = Field(alias="apiHealthy")
    db_healthy: bool = Field(alias="dbHealthy")
    overall_healthy: bool = Field(alias="overallHealthy")

    @classmethod
    def from_fields(cls, api_healthy: bool, db_healthy: bool):
        return cls(api_healthy=api_healthy, db_healthy=db_healthy, overall_healthy=api_healthy and db_healthy)

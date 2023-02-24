from app.dependencies import get_db
from app.internal.healthcheck import Healthcheck
from app.schemas.health import AppHealth
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/health",
    tags=["health"],
    responses={404: {"description": "Not found"}},
)


@router.get(
    "",
    description="Indicates the status of the service",
    status_code=status.HTTP_200_OK,
    response_model=AppHealth,
)
async def liveness_probe(db: Session = Depends(get_db)) -> AppHealth:
    return Healthcheck(db).health()

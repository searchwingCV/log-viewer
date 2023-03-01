from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from src.dependencies import get_db
from src.internal.healthcheck import Healthcheck
from src.schemas.health import AppHealth

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

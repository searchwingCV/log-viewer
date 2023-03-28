from typing import Union

from application.services.dependencies import get_drone_service
from application.services.drone import DroneService
from common.constants import DEFAULT_PAGE_LEN
from common.exceptions.db import DuplicatedKeyError
from common.logging import get_logger
from fastapi import APIRouter, Depends, HTTPException, Query, status
from presentation.rest.serializers import Page, Params
from presentation.rest.serializers.drone import CreateDroneSerializer, DroneSerializer

logger = get_logger(__name__)
ROUTE_PREFIX = "/drone"
router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=["drone"],
    responses={404: {"description": "Not found"}},
)


@router.post("", response_model=DroneSerializer, status_code=status.HTTP_201_CREATED)
async def add_drone(
    drone: CreateDroneSerializer,
    drone_service: DroneService = Depends(get_drone_service),
):
    try:
        return DroneSerializer.from_orm(drone_service.upsert(drone)).to_json()
    except DuplicatedKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The following drone already exists: {drone.name}",
        )
    except Exception as err:
        logger.exception("Exception detected!")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.get("", response_model=Page[DroneSerializer], status_code=status.HTTP_200_OK)
async def retrieve_drones(
    page: Union[int, None] = Query(default=1),
    size: Union[int, None] = Query(default=DEFAULT_PAGE_LEN),
    drone_service: DroneService = Depends(get_drone_service),
):
    total, drones = drone_service.get_all_with_pagination(page, size)
    return Page.create(items=drones, total=total, params=Params(page=page, size=size, path=ROUTE_PREFIX))


@router.patch("", response_model=DroneSerializer, status_code=status.HTTP_200_OK)
async def update_drone(
    drone_to_update: DroneSerializer,
    drone_service: DroneService = Depends(get_drone_service),
):
    drone = drone_service.get_by_id(drone_to_update.id)
    if drone:
        try:
            updated_drone = drone_service.upsert(drone_to_update)
            return DroneSerializer.from_orm(drone_service.upsert(updated_drone)).to_json()
        except Exception as e:
            logger.exception(f"Exception detected: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The following drone does not exist: {drone_to_update.name}",
        )

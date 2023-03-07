from typing import Union

from application.services.dependencies import get_plane_service
from application.services.plane import PlaneService
from common.constants import DEFAULT_PAGE_LEN
from common.exceptions.db import DuplicatedKeyError
from common.logging import get_logger
from fastapi import APIRouter, Depends, HTTPException, Query, status
from presentation.rest.serializers import Page, Params
from presentation.rest.serializers.plane import CreatePlaneSerializer, PlaneSerializer

logger = get_logger(__name__)
ROUTE_PREFIX = "/plane"
router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=["plane"],
    responses={404: {"description": "Not found"}},
)


@router.post("", response_model=PlaneSerializer, status_code=status.HTTP_201_CREATED)
async def add_plane(
    plane: CreatePlaneSerializer,
    plane_service: PlaneService = Depends(get_plane_service),
):
    try:
        return PlaneSerializer.from_orm(plane_service.upsert(plane)).to_json()
    except DuplicatedKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The following plane already exists: {plane.alias}",
        )
    except Exception as err:
        logger.exception("Exception detected!")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.get("", response_model=Page[PlaneSerializer], status_code=status.HTTP_200_OK)
async def retrieve_planes(
    page: Union[int, None] = Query(default=1),
    size: Union[int, None] = Query(default=DEFAULT_PAGE_LEN),
    plane_service: PlaneService = Depends(get_plane_service),
):
    total, planes = plane_service.get_all_with_pagination(page, size)
    return Page.create(items=planes, total=total, params=Params(page=page, size=size, path=ROUTE_PREFIX))


@router.patch("", response_model=PlaneSerializer, status_code=status.HTTP_200_OK)
async def update_plane(
    plane_to_update: PlaneSerializer,
    plane_service: PlaneService = Depends(get_plane_service),
):
    plane = plane_service.get_by_id(plane_to_update.id)
    if plane:
        try:
            updated_plane = plane_service.upsert(plane_to_update)
            return PlaneSerializer.from_orm(plane_service.upsert(updated_plane)).to_json()
        except Exception as e:
            logger.exception(f"Exception detected: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The following plane does not exists: {plane_to_update.alias}",
        )

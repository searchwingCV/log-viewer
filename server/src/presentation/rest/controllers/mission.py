from typing import Union

from application.services import MissionService
from common.constants import DEFAULT_PAGE_LEN
from common.exceptions.db import DuplicatedKeyError
from common.logging import get_logger
from fastapi import APIRouter, Depends, HTTPException, Query, status
from presentation.rest.dependencies import get_mission_service
from presentation.rest.mixins import CRUDMixin
from presentation.rest.serializers import Page, Params, UpdateSerializer
from presentation.rest.serializers.mission import (
    CreateMissionSerializer,
    MissionDeletion,
    MissionSerializer,
    MissionUpdate,
)
from presentation.rest.serializers.responses import BatchUpdateResponse

logger = get_logger(__name__)
ROUTE_PREFIX = "/mission"
router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=["mission"],
    responses={404: {"description": "Not found"}},
)


@router.post("", response_model=MissionSerializer, status_code=status.HTTP_201_CREATED)
async def add_mission(
    mission: CreateMissionSerializer,
    mission_service: MissionService = Depends(get_mission_service),
):
    try:
        return MissionSerializer.from_orm(mission_service.upsert(mission)).to_json()
    except DuplicatedKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The following mission already exists: {mission.name}",
        )
    except Exception as err:
        logger.exception("Exception detected!")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.patch(
    "",
    response_model=BatchUpdateResponse[MissionSerializer],
    status_code=status.HTTP_200_OK,
    description="Update missions in batch",
)
async def update_missions(
    missions_to_update: UpdateSerializer[MissionUpdate],
    mission_service: MissionService = Depends(get_mission_service),
):
    response = CRUDMixin.update_items(missions_to_update, mission_service)
    return response


@router.get("", response_model=Page[MissionSerializer], status_code=status.HTTP_200_OK)
async def retrieve_all_missions(
    page: Union[int, None] = Query(default=1),
    size: Union[int, None] = Query(default=DEFAULT_PAGE_LEN),
    mission_service: MissionService = Depends(get_mission_service),
):
    total, missions = mission_service.get_all_with_pagination(page, size)
    return Page.create(
        items=missions,
        total=total,
        params=Params(page=page, size=size, path=ROUTE_PREFIX),
    )


@router.delete("/{id}", response_model=MissionDeletion, status_code=status.HTTP_200_OK)
async def delete_mission(id: int, mission_service: MissionService = Depends(get_mission_service)):
    try:
        mission_service.delete_by_id(id)
    except Exception as e:
        logger.exception(f"Exception detected: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    return MissionDeletion(msg="Deleted", mission_id=id).to_json()

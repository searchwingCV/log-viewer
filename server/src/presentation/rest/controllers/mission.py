from typing import Union

from application.services import MissionService
from application.services.dependencies import get_mission_service
from common.constants import DEFAULT_PAGE_LEN
from common.exceptions.db import DuplicatedKeyError
from common.logging import get_logger
from domain.mission.entities import Mission
from fastapi import APIRouter, Depends, HTTPException, Query, status
from presentation.rest.serializers import Page, Params
from presentation.rest.serializers.mission import CreateMissionSerializer, MissionDeletion, MissionSerializer

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
            detail=f"The following mission already exists: {mission.alias}",
        )
    except Exception as err:
        logger.exception("Exception detected!")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.patch("", response_model=MissionSerializer, status_code=status.HTTP_200_OK)
async def update_mission(
    mission_to_update: Mission,
    mission_service: MissionService = Depends(get_mission_service),
):
    mission = mission_service.get_by_id(mission_to_update.id)
    if mission:
        try:
            return mission_service.upsert(mission_to_update)
        except Exception as e:
            logger.exception(f"Exception detected: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The following mission does not exists: {mission.alias}",
        )


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

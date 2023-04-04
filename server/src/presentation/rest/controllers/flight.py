from typing import Union

from application.services.file import FileService
from application.services.flight import FlightService
from common.constants import DEFAULT_PAGE_LEN
from common.exceptions.db import NotFoundException
from common.logging import get_logger
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, UploadFile, status
from fastapi_pagination import add_pagination
from infrastructure.dependencies import get_db, get_storage
from infrastructure.storage import Storage
from presentation.rest.dependencies import get_flight_service
from presentation.rest.mixins import CRUDMixin
from presentation.rest.serializers import Page, Params, UpdateSerializer
from presentation.rest.serializers.errors import InvalidPayloadError, NotFoundError
from presentation.rest.serializers.flight import (
    CreateFlightSerializer,
    FileUploadResponse,
    FlightDeletion,
    FlightFilesListResponse,
    FlightSerializer,
    FlightUpdate,
)
from presentation.rest.serializers.responses import BatchUpdateResponse
from sqlalchemy.orm import Session

ROUTE_PREFIX = "/flight"
router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=["flight"],
    responses={404: {"description": "Not found"}},
)

logger = get_logger(__name__)
file_service = FileService()


@router.post("", response_model=FlightSerializer, status_code=status.HTTP_201_CREATED)
async def add_flight(
    flight: CreateFlightSerializer,
    flight_service: FlightService = Depends(get_flight_service),
):
    try:
        return FlightSerializer.from_orm(flight_service.create(flight))
    except NotFoundException as e:
        error = InvalidPayloadError(detail=str(e))
        return Response(status_code=status.HTTP_400_BAD_REQUEST, content=error.json())
    except Exception as err:
        logger.exception("Exception detected!")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.get("", response_model=Page[FlightSerializer], status_code=status.HTTP_200_OK)
async def retrieve_all_flights(
    page: Union[int, None] = Query(default=1),
    size: Union[int, None] = Query(default=DEFAULT_PAGE_LEN),
    flight_service: FlightService = Depends(get_flight_service),
):
    total, flights = flight_service.get_all_with_pagination(page, size)
    return Page.create(
        items=flights,
        total=total,
        params=Params(page=page, size=size, path=ROUTE_PREFIX),
    )


@router.get("/{id}", response_model=FlightSerializer, status_code=status.HTTP_200_OK)
async def retrieve_flight(id: int, flight_service: FlightService = Depends(get_flight_service)):
    try:
        flight = flight_service.get_by_id(id)
        if not flight:
            return Response(status_code=status.HTTP_404_NOT_FOUND, content=NotFoundError(id=id).json())
        return flight
    except Exception as err:
        logger.exception("Exception detected!")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.patch(
    "",
    response_model=BatchUpdateResponse[FlightSerializer],
    status_code=status.HTTP_200_OK,
    description="Update flights in batch",
)
async def update_flight(
    flights_to_update: UpdateSerializer[FlightUpdate],
    flight_service: FlightService = Depends(get_flight_service),
):
    response = CRUDMixin.update_items(flights_to_update, flight_service)
    return response


@router.delete("/{id}", response_model=FlightDeletion, status_code=status.HTTP_200_OK)
async def delete_mission(id: int, flight_service: FlightService = Depends(get_flight_service)):
    try:
        flight_service.delete_by_id(id)
    except Exception as e:
        logger.exception(f"Exception detected: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    return FlightDeletion(msg="Deleted", flight_id=int).to_json()


@router.put("/{flight_id}/log-file", response_model=FileUploadResponse)
def upload_log_file(
    flight_id: int,
    file: UploadFile,
    storage: Storage = Depends(get_storage),
    db: Session = Depends(get_db),
):
    try:
        return file_service.upload_log_file(flight_id, storage, file, db)
    except Exception as err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.put("/{flight_id}/tlog-file", response_model=FileUploadResponse)
def upload_tlog_file(
    flight_id: int,
    file: UploadFile,
    storage: Storage = Depends(get_storage),
    db: Session = Depends(get_db),
):
    try:
        return file_service.upload_tlog_file(flight_id, storage, file, db)
    except Exception as err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.put("/{flight_id}/rosbag-file", response_model=FileUploadResponse)
def upload_rosbag_file(
    flight_id: int,
    file: UploadFile,
    storage: Storage = Depends(get_storage),
    db: Session = Depends(get_db),
):
    try:
        return file_service.upload_rosbag_file(flight_id, storage, file, db)
    except Exception as err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.put("/{flight_id}/apm-file", response_model=FileUploadResponse)
def upload_apm_param_file(
    flight_id: int,
    file: UploadFile,
    storage: Storage = Depends(get_storage),
    db: Session = Depends(get_db),
):
    try:
        return file_service.upload_apm_param_file(flight_id, storage, file, db)
    except Exception as err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.delete("/{flight_id}/apm-file", status_code=status.HTTP_204_NO_CONTENT)
def delete_apm_param_file(
    file_id: int,
    storage: Storage = Depends(get_storage),
    db: Session = Depends(get_db),
):
    try:
        file_service.delete_apm_param_file(file_id, storage, db)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.delete("/{flight_id}/log-file", status_code=status.HTTP_204_NO_CONTENT)
def delete_log_file(
    file_id: int,
    storage: Storage = Depends(get_storage),
    db: Session = Depends(get_db),
):
    try:
        file_service.delete_log_file(file_id, storage, db)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.delete("/{flight_id}/tlog-file", status_code=status.HTTP_204_NO_CONTENT)
def delete_tlog_file(
    file_id: int,
    storage: Storage = Depends(get_storage),
    db: Session = Depends(get_db),
):
    try:
        file_service.delete_tlog_file(file_id, storage, db)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.delete("/{flight_id}/file/rosbag-file", status_code=status.HTTP_204_NO_CONTENT)
def delete_rosbag_file(
    file_id: int,
    storage: Storage = Depends(get_storage),
    db: Session = Depends(get_db),
):
    try:
        file_service.delete_rosbag_file(file_id, storage, db)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.get("/{flight_id}/files/list", response_model=FlightFilesListResponse)
def list_files(flight_id: int, request: Request, db: Session = Depends(get_db)):
    try:
        return file_service.list_all_files(flight_id, db, request.base_url)
    except Exception as err:
        logger.exception("Exception detected!")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


add_pagination(router)

from typing import Union

from application.services.file import FileService
from common.constants import DEFAULT_PAGE_LEN
from common.logging import get_logger
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, UploadFile, status
from fastapi_pagination import add_pagination
from fastapi_pagination.ext.sqlalchemy import paginate
from infrastructure.db.orm import Flight
from infrastructure.dependencies import get_db, get_storage
from infrastructure.storage import Storage
from presentation.rest.serializers import Page, Params
from presentation.rest.serializers.flight import (
    CreateFlightSerializer,
    FileUploadResponse,
    FlightDeletion,
    FlightFilesListResponse,
    FlightSerializer,
)
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/flight",
    tags=["flight"],
    responses={404: {"description": "Not found"}},
)

logger = get_logger(__name__)
file_service = FileService()


@router.post("", response_model=FlightSerializer, status_code=status.HTTP_201_CREATED)
async def add_flight(flight: CreateFlightSerializer, db: Session = Depends(get_db)):
    try:
        flight_db = Flight(**flight.dict())
        db.add(flight_db)
        db.commit()
    except Exception as err:
        logger.exception("Exception detected!")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))
    return FlightSerializer.from_orm(flight_db)


@router.get("", response_model=Page[FlightSerializer], status_code=status.HTTP_200_OK)
async def retrieve_flight(
    flight_id: Union[int, None] = Query(default=None),
    page: Union[int, None] = Query(default=1),
    size: Union[int, None] = Query(default=DEFAULT_PAGE_LEN),
    db: Session = Depends(get_db),
):
    if flight_id is not None:
        flights = db.query(Flight).filter_by(flight_id=flight_id)
    else:
        flights = db.query(Flight)
    return paginate(flights, Params(page=page, size=size, path="/flight"))


@router.patch("/{flight_id}", response_model=FlightSerializer, status_code=status.HTTP_200_OK)
async def update_flight(flight_id: int, flight_to_update: CreateFlightSerializer, db: Session = Depends(get_db)):
    stored_flight = db.query(Flight).filter_by(flight_id=flight_id).first()
    if stored_flight:
        try:
            stored_flight_schema = FlightSerializer.from_orm(stored_flight)
            update_data = flight_to_update.dict(exclude_unset=True)
            updated_flight = stored_flight_schema.copy(update=update_data)
            db.query(Flight).filter_by(flight_id=flight_id).update(update_data)
            db.commit()
            return updated_flight.to_json()
        except Exception as e:
            logger.exception(f"Exception detected: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The requested flight does not exist: {flight_id=}",
        )


@router.delete("/{flight_id}", response_model=FlightDeletion, status_code=status.HTTP_200_OK)
async def delete_mission(
    flight_id: Union[str, None] = Query(default=None),
    db: Session = Depends(get_db),
):
    try:
        mission = db.query(Flight).filter_by(flight_id=flight_id)
        if mission is None:
            HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"The following flight does not exists, ID -> {flight_id}",
            )
        mission.delete()
        db.commit()
    except Exception as e:
        logger.exception(f"Exception detected: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    return FlightDeletion(msg="Deleted", flight_id=flight_id).to_json()


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

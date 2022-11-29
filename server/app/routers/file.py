import os

from app.dependencies import get_db, get_storage
from app.internal.logging import get_logger
from app.internal.storage import Storage
from app.schemas.file import FileUploadResponse, FlightFilesList
from app.services.file import FileService
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

logger = get_logger(__name__)
router = APIRouter(
    prefix="/file",
    tags=["file"],
    responses={404: {"description": "Not found"}},
)
file_service = FileService()


@router.post("/log/<flight_id>", response_model=FileUploadResponse)
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


@router.post("/tlog/<flight_id>", response_model=FileUploadResponse)
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


@router.post("/rosbag/<flight_id>", response_model=FileUploadResponse)
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


@router.post("/apm/<flight_id>", response_model=FileUploadResponse)
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


@router.get("/<flight_id>/list", response_model=FlightFilesList)
def list_files(flight_id: int, request: Request, db: Session = Depends(get_db)):
    try:
        return file_service.list_all_files(flight_id, db, request.base_url)
    except Exception as err:
        logger.exception("Exception detected!")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.get("")
async def get_file_from_uri(uri: str, storage: Storage = Depends(get_storage)):
    path = uri.replace(f"{storage.protocol}://", "")
    if storage.protocol == "file":
        if os.path.isfile(path):
            return FileResponse(path, filename=os.path.basename(path))
        else:
            raise HTTPException(404, "File not found")
    else:
        raise HTTPException(501, f"Not implemented -> {storage.protocol=}")

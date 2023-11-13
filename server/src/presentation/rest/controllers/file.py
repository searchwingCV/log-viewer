from application.services.file import FileService
from common.exceptions.db import NotFoundException
from common.logging import get_logger
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from presentation.rest.dependencies import get_file_service

router = APIRouter(
    prefix="/file",
    tags=["file"],
    responses={404: {"description": "Not found"}},
)

logger = get_logger(__name__)


@router.get("/{id}", response_class=StreamingResponse)
def download_file(id: str, file_service: FileService = Depends(get_file_service)):
    try:
        io_file = file_service.get_file(id)
        filename = io_file.flight_file.location.split("/")[-1]
        return StreamingResponse(
            content=io_file.io,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except (FileNotFoundError, NotFoundException):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File not found")

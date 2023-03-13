from common.logging import get_logger
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from infrastructure.dependencies import get_storage
from infrastructure.storage import Storage
from src.common.encryption import decrypt


router = APIRouter(
    prefix="",
    tags=["root"],
    responses={404: {"description": "Not found"}},
    include_in_schema=False,
)

logger = get_logger(__name__)


@router.get("/file/{path}", response_class=StreamingResponse)
async def get_file_from_path(path: str, storage: Storage = Depends(get_storage)):
    try:
        decrypted_path = decrypt(path)
        binary = storage.get(decrypted_path)
        filename = decrypted_path.split("/")[-1]
        return StreamingResponse(
            content=binary,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except FileNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File not found")
    except Exception as e:
        logger.exception("Error! see trace...")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/", description="Welcome")
async def main(request: Request):
    return {"msg": f"Welcome to the Searchiwng Log API! To check the docs please visit: {request.url._url}docs"}

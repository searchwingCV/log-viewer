import os

from common.encryption import decrypt
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from infrastructure.dependencies import get_storage
from infrastructure.storage import Storage

router = APIRouter(prefix="", tags=["root"], responses={404: {"description": "Not found"}}, include_in_schema=False)


@router.get("/file/{uri}", response_class=FileResponse)
async def get_file_from_uri(uri: str, storage: Storage = Depends(get_storage)):
    uri = decrypt(uri)
    path = uri.replace(f"{storage.protocol}://", "")
    if storage.protocol == "file":
        if os.path.isfile(path):
            return FileResponse(path, filename=os.path.basename(path))
        else:
            raise HTTPException(404, "File not found")
    else:
        raise HTTPException(501, f"Not implemented -> {storage.protocol=}")


@router.get("/", description="Welcome")
async def main(request: Request):
    return {"msg": f"Welcome to the Searchiwng Log API! To check the docs please visit: {request.url._url}docs"}

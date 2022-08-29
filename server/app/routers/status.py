from fastapi import APIRouter, status

router = APIRouter(
    prefix="/status",
    tags=["status"],
    responses={404: {"description": "Not found"}},
)


@router.get(
    "",
    description="Indicates the status of the service",
    status_code=status.HTTP_200_OK,
)
async def liveness_probe():
    return {"status": "OK!"}

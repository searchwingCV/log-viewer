from fastapi import APIRouter
router = APIRouter(
    prefix="/status",
    tags=["status"],
    responses={404: {"description": "Not found"}},
)
@router.get("/")
async def hello_world():
    return {"status": "OK!"}

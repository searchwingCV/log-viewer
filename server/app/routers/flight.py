from fastapi import APIRouter

router = APIRouter(
    prefix="/flight",
    tags=["flight"],
    responses={404: {"description": "Not found"}},
)


@router.post("")
async def create_flight():
    return {"response": "You created a flight!"}


@router.get("")
async def get_flights():
    flights = {}
    return flights


@router.patch("")
async def modify_flight():
    pass

from fastapi import APIRouter

router = APIRouter(
    prefix="/logs",
    tags=["logs"],
    responses={404: {"description": "Not found"}},
)


@router.post("")
async def create_flight():
    return {"response": "You created a flight!"}


@router.get("/{flight_id}")
async def get_flight_metadata(flight_id: str):
    return {"flightId": flight_id}

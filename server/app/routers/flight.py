from typing import Union

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi_pagination import add_pagination
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy.orm import Session

from ..constants import DEFAULT_PAGE_LEN
from ..dependencies import get_db
from ..internal.logging import get_logger
from ..models.metadata import Flight
from ..schemas.base import Page, Params
from ..schemas.flight import BaseFlightSchema, FlightDeletion, FlightSchema

router = APIRouter(
    prefix="/flight",
    tags=["flight"],
    responses={404: {"description": "Not found"}},
)

logger = get_logger(__name__)


@router.post("", response_model=FlightSchema, status_code=status.HTTP_201_CREATED)
async def add_flight(flight: BaseFlightSchema, db: Session = Depends(get_db)):
    try:
        flight_db = Flight(**flight.dict())
        db.add(flight_db)
        db.commit()
    except Exception as err:
        logger.exception("Exception detected!")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))
    return FlightSchema.from_orm(flight_db)


@router.get("", response_model=Page[FlightSchema], status_code=status.HTTP_200_OK)
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


@router.patch("/{flight_id}", response_model=FlightSchema, status_code=status.HTTP_200_OK)
async def update_flight(flight_id: int, flight_to_update: BaseFlightSchema, db: Session = Depends(get_db)):
    stored_flight = db.query(Flight).filter_by(flight_id=flight_id).first()
    if stored_flight:
        try:
            stored_flight_schema = FlightSchema.from_orm(stored_flight)
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


add_pagination(router)

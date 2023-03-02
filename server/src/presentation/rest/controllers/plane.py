from typing import Union

from common.constants import DEFAULT_PAGE_LEN
from common.exceptions.db import DuplicatedKeyError
from common.logging import get_logger
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi_pagination import add_pagination
from fastapi_pagination.ext.sqlalchemy import paginate
from infrastructure.db.orm import Plane
from infrastructure.dependencies import get_db
from presentation.rest.serializers import Page, Params
from presentation.rest.serializers.plane import CreatePlaneSerializer, PlaneSerializer
from sqlalchemy.orm import Session

logger = get_logger(__name__)
router = APIRouter(
    prefix="/plane",
    tags=["plane"],
    responses={404: {"description": "Not found"}},
)


@router.post("", response_model=PlaneSerializer, status_code=status.HTTP_201_CREATED)
async def add_plane(plane: CreatePlaneSerializer, db: Session = Depends(get_db)):
    try:
        from infrastructure.repositories.plane import PlaneRepository

        plane_repo = PlaneRepository()
        return PlaneSerializer.from_orm(plane_repo.upsert(db, plane)).to_json()
    except DuplicatedKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The following plane already exists: {plane.alias}",
        )
    except Exception as err:
        logger.exception("Exception detected!")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))


@router.get("", response_model=Page[PlaneSerializer], status_code=status.HTTP_200_OK)
async def retrieve_plane(
    alias: Union[str, None] = Query(default=None),
    page: Union[int, None] = Query(default=1),
    size: Union[int, None] = Query(default=DEFAULT_PAGE_LEN),
    db: Session = Depends(get_db),
):
    if alias is not None:
        planes = db.query(Plane).filter_by(alias=alias)
    else:
        planes = db.query(Plane)
    return paginate(planes, Params(page=page, size=size, path="/plane"))


@router.patch("/{plane_id}", response_model=PlaneSerializer, status_code=status.HTTP_200_OK)
async def update_plane(plane_id: int, plane_to_update: CreatePlaneSerializer, db: Session = Depends(get_db)):
    stored_plane = db.query(Plane).filter_by(plane_id=plane_id).first()
    if stored_plane:
        try:
            stored_plane_model = PlaneSerializer.from_orm(stored_plane)
            update_data = plane_to_update.dict(exclude_unset=True)
            updated_plane = stored_plane_model.copy(update=update_data)
            db.query(Plane).filter_by(id=plane_id).update(update_data)
            db.commit()
            return updated_plane.to_json()
        except Exception as e:
            logger.exception(f"Exception detected: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The following plane does not exists: {plane_to_update.alias}",
        )


add_pagination(router)

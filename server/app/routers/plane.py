from curses.ascii import BS
from typing import Union
from fastapi import APIRouter, Depends, Query, status, HTTPException
from psycopg2.errors import UniqueViolation
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from ..schemas.metadata import PlaneDetailsSchema, BasePlaneSchema
from ..dependencies import get_db
from ..models.metadata import PlaneDetails
from ..internal.logging import get_logger
from fastapi_pagination import Page, add_pagination
from fastapi_pagination.ext.sqlalchemy import paginate


logger = get_logger(__name__)
router = APIRouter(
    prefix="/plane",
    tags=["plane"],
    responses={404: {"description": "Not found"}},
)


@router.post("", response_model=PlaneDetailsSchema, status_code=status.HTTP_201_CREATED)
async def add_plane(plane: BasePlaneSchema, db: Session = Depends(get_db)):
    try:
        plane_db = PlaneDetails(
            plane_alias=plane.alias, model=plane.model, in_use=plane.in_use
        )
        db.add(plane_db)
        db.commit()
    except IntegrityError as e:
        assert isinstance(e.orig, UniqueViolation)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The following plane already exists: {plane.alias}",
        )
    except Exception as err:
        logger.exception("Exception detected!")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err)
        )
    return PlaneDetailsSchema(
        **dict(
            {
                "createdAt": plane_db.created_at,
                "updatedAt": plane_db.updated_at,
                "planeId": plane_db.plane_id,
            },
            **plane.to_json(),
        )
    ).to_json()


@router.get("", response_model=Page[PlaneDetailsSchema], status_code=status.HTTP_200_OK)
async def retrieve_plane(
    plane_alias: Union[str, None] = Query(default=None), db: Session = Depends(get_db)
):
    if plane_alias is not None:
        planes = db.query(PlaneDetails).filter_by(plane_alias=plane_alias)
    else:
        planes = db.query(PlaneDetails)
    return paginate(planes)


@router.patch(
    "/<plane_id>", response_model=PlaneDetailsSchema, status_code=status.HTTP_200_OK
)
async def update_plane(
    plane_id: int, plane_to_update: BasePlaneSchema, db: Session = Depends(get_db)
):
    stored_plane = db.query(PlaneDetails).filter_by(plane_id=plane_id).first()
    if stored_plane:
        try:
            stored_plane_model = PlaneDetailsSchema.from_orm(stored_plane)
            update_data = plane_to_update.dict(exclude_unset=True)
            updated_plane = stored_plane_model.copy(update=update_data)
            db.query(PlaneDetails).filter_by(plane_id=plane_id).update(update_data)
            db.commit()
            return updated_plane.to_json()
        except Exception as e:
            logger.exception(f"Exception detected: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err)
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The following plane does not exists: {stored_plane.alias}",
        )


add_pagination(router)

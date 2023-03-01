from typing import NewType

import strawberry
from psycopg2.errors import UniqueViolation
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from src.dependencies import configure_db_session
from src.models.metadata import PlaneDetails
from src.schemas.plane import PlaneGraphType

JSON = strawberry.scalar(
    NewType("JSON", object),
    description="The `JSON` scalar type represents JSON values as specified by ECMA-404",
    serialize=lambda v: v,
    parse_value=lambda v: v,
)

SessionLocal = configure_db_session()


@strawberry.type
class Query:
    @strawberry.field
    def get_all_planes(self) -> list[PlaneGraphType]:
        db: Session = SessionLocal()
        planes = db.query(PlaneDetails).all()
        return [PlaneGraphType.marshall(plane) for plane in planes]


@strawberry.type
class Mutation:
    @strawberry.field
    def add_plane(self, plane_alias: str, model: str) -> list[PlaneGraphType]:
        try:
            db: Session = SessionLocal()
            plane_db = PlaneDetails(plane_alias=plane_alias, model=model, in_use=True)
            db.add(plane_db)
            db.commit()
        except IntegrityError as e:
            assert isinstance(e.orig, UniqueViolation)
            raise
        finally:
            db.close()
        return PlaneGraphType.marshall(plane_db)

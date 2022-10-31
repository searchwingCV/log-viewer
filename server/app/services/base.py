from typing import Generic, TypeVar, get_args
from uuid import UUID

from app.internal.exceptions.db import DBException, NotFoundException
from app.models.metadata import Base
from app.schemas.base import BaseSchema
from sqlalchemy.orm import Session

Schema = TypeVar("Schema", bound=BaseSchema)
Model = TypeVar("Model", bound=Base)


class CRUDBase(Generic[Model]):
    model: Base
    serializer: BaseSchema
    id_alias: str = "id"

    def __init_subclass__(self) -> None:
        self.model = get_args(self.__orig_bases__[0])[0]  # type: ignore
        self.serializer = get_args(self.__orig_bases__[0])[1]  # type: ignore
        self.table_name = self.model.__tablename__
        self.id_alias = "id"

    def patch(
        self, session: Session, id: int, filters: dict, data: BaseSchema
    ) -> Model:
        stored_data = session.query(self.model).filter_by(**filters).first()
        if stored_data:
            try:
                stored_data_schema = self.serializer.from_orm(data)
                update_data = stored_data_schema.dict(exclude_unset=True)
                updated_data = stored_data_schema.copy(update=update_data)
                session.query(self.table_name).filter_by(mission_id=id).update(
                    updated_data
                )
                session.commit()
                return updated_data.to_json()
            except Exception as e:
                raise DBException(self.table_name, e)

    def post(self, session: Session, data: Schema, return_model: Schema) -> Model:
        try:
            data_db: Model = self.model(**data.dict())
            session.add(data_db)
            session.commit()
        except Exception as e:
            raise DBException(self.table_name, e)
        return return_model.from_orm(data_db)

    def delete(self, session: Session, id: int) -> UUID:
        existing_data = self.get(session, id)
        try:
            session.delete(existing_data)
            session.commit()
        except Exception as e:
            raise DBException(self.table_name, e)
        return id

    def get(self, session: Session, id: int) -> Model:
        results = None
        try:
            results = session.get(self.model, id)  # type: ignore
        except Exception as e:
            raise DBException(self.table_name, e)
        if not results:
            raise NotFoundException(id, self.table_name)
        else:
            return results  # type: ignore

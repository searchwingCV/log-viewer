from typing import List, Type, Union

from domain.types import BaseModel as BaseEntity
from domain.types import ID_Type, T_Model
from infrastructure.db.session import SessionContextManager
from infrastructure.repositories.base import BaseRepository


class BaseCRUDService:

    _entity: Type[T_Model] = BaseEntity

    def __init__(
        self,
        repository: BaseRepository,
        session: SessionContextManager = SessionContextManager(),
    ):
        self._repository = repository
        self._session = session

    def get_by_id(self, id: ID_Type) -> Union[T_Model, None]:
        with self._session as session:
            result = self._repository.get_by_id(session, id)
        return result

    def delete_by_id(self, id: ID_Type) -> None:
        with self._session as session:
            result = self._repository.delete_by_id(session, id)
        return result

    def upsert(self, data: T_Model) -> T_Model:
        with self._session as session:
            result = self._repository.upsert(session=session, data=data)
        return result

    def get_all_with_pagination(self, page: int, size: int) -> List[T_Model]:
        with self._session as session:
            result = self._repository.get_with_pagination(session, page, size)
        return result

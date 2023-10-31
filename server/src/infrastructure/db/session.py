from typing import Optional, Type

from common.config import BaseConfig, get_current_config
from sqlalchemy import create_engine
from sqlalchemy.orm import Session as sqlalchemySession
from sqlalchemy.orm import scoped_session, sessionmaker


class SessionContextManager:
    def __init__(self, config: Optional[Type[BaseConfig]] = get_current_config()) -> None:
        self._engine = create_engine(
            config.SQLALCHEMY_DATABASE_URI,
            pool_pre_ping=True,
            pool_size=config.SQLALCHEMY_POOL_SIZE,
            max_overflow=config.SQLALCHEMY_MAX_OVERFLOW,
        )
        self._session_maker = sessionmaker(autocommit=False, autoflush=False, bind=self._engine)

    def __enter__(self, *args, **kwargs) -> sqlalchemySession:
        self._session = scoped_session(self._session_maker)
        return self._session

    def __exit__(self, exc_type, exc, tb):
        self._session.close()

    def commit(self):
        self._session.commit()

    def rollback(self):
        self._session.rollback()

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from ..config import Config  # noqa

basedir = os.path.abspath(os.path.dirname(__file__))


def configure_db_session() -> Session:

    engine = create_engine(Config.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    return SessionLocal

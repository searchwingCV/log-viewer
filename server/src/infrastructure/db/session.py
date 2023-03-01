import os

from common.config import Config  # noqa
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

basedir = os.path.abspath(os.path.dirname(__file__))


def configure_db_session() -> Session:

    engine = create_engine(Config.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    return SessionLocal

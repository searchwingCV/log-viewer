from src.config import Config
from src.internal.database import configure_db_session
from src.internal.storage import Storage

SessionLocal = configure_db_session()


def get_db():
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def get_storage():
    storage = Storage(Config.STORAGE_ROOT, Config.STORAGE_PROTOCOL)
    yield storage

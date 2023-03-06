from common.config import Config
from infrastructure.db.session import SessionContextManager
from infrastructure.storage import Storage


def get_session():
    with SessionContextManager() as session:
        yield session


def get_storage():
    storage = Storage(Config.STORAGE_ROOT, Config.STORAGE_PROTOCOL)
    yield storage

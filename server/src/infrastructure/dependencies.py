from common.config import Config
from infrastructure.db.session import SessionContextManager
from infrastructure.storage import Storage


def get_db():
    with SessionContextManager() as session:
        yield session


def get_storage():
    storage = Storage(
        rootpath=Config.STORAGE_ROOT,
        protocol=Config.STORAGE_PROTOCOL,
        options={option: value for option, value in Config.STORAGE_OPTIONS.items() if option is not None},
    )
    yield storage

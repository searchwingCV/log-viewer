import os
from typing import Dict, Type

from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, os.pardir, ".env"))


class BaseConfig(object):
    SQLALCHEMY_DATABASE_URI = (
        f"postgresql+psycopg2://{os.environ['POSTGRES_USER']}:{os.environ['POSTGRES_PASSWORD']}"
        f"@{os.environ['POSTGRES_SERVER']}:{os.environ['POSTGRES_PORT']}"
        f"/{os.environ['POSTGRES_DB']}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    STORAGE_PROTOCOL = os.getenv("STORAGE_PROTOCOL", "file")
    STORAGE_ROOT = os.getenv("STORAGE_PROTOCOL", "/data")


class Config(BaseConfig):
    LOG_LEVEL = 20


class DevConfig(BaseConfig):
    LOG_LEVEL = 10


class TestConfig(BaseConfig):
    LOG_LEVEL = 10
    SQLALCHEMY_DATABASE_URI = (
        "postgresql+psycopg2://"
        f"{os.getenv('POSTGRES_USER')}:"
        f"{os.getenv('POSTGRES_PASSWORD')}"
        f"@{os.getenv('POSTGRES_TEST_SERVER')}:{os.getenv('POSTGRES_TEST_PORT')}"
        f"/{os.getenv('POSTGRES_DB')}"
    )
    TESTING = True
    RETRY_LIMIT = 1


_config_mapping: Dict[str, Type[BaseConfig]] = {
    "test": TestConfig,
    "prod": Config,
    "dev": DevConfig,
}


def get_current_config() -> Type[BaseConfig]:
    current_env = os.getenv("APP_SETTINGS", "dev")
    config = _config_mapping.get(current_env, DevConfig)
    return config

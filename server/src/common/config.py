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
    STORAGE_ROOT = os.getenv("STORAGE_ROOT", "/data")

    STORAGE_OPTIONS = {
        "host": os.getenv("STORAGE_HOST"),
        "username": os.getenv("STORAGE_USERNAME"),
        "password": os.getenv("STORAGE_PASSWORD"),
    }

    REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
    REDIS_PORT = os.getenv("REDIS_PORT", "6379")
    REDIS_DB = os.getenv("REDIS_DB", "0")
    REDIS_PWD = os.getenv("REDIS_PWD", "searchwing")

    CELERY_CONFIG = {
        "broker_url": f"redis://:{REDIS_PWD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}",
        "result_backend": f"redis://:{REDIS_PWD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}",
    }

    MAVLOG_TIMESERIES_MAX_RATE_HZ = float(os.getenv("MAVLOG_TIMESERIES_MAX_RATE_HZ", 20))
    MAVLOG_TIMESERIES_TYPES = os.getenv("MAVLOG_TIMESERIES_TYPES", "").split(",")
    if not MAVLOG_TIMESERIES_TYPES:
        MAVLOG_TIMESERIES_TYPES = None


class Config(BaseConfig):
    LOG_LEVEL = 20


class DevConfig(BaseConfig):
    LOG_LEVEL = 10


class TestConfig(BaseConfig):
    LOG_LEVEL = 10
    SQLALCHEMY_DATABASE_URI = (
        "postgresql+psycopg2://"
        f"{os.getenv('POSTGRES_TEST_USER', 'postgres')}:"
        f"{os.getenv('POSTGRES_TEST_PASSWORD', 'postgres')}"
        f"@{os.getenv('POSTGRES_TEST_SERVER')}:{os.getenv('POSTGRES_TEST_PORT')}"
        f"/{os.getenv('POSTGRES_TEST_DB', 'postgres')}"
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

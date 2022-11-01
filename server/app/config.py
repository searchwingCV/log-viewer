import os

from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, os.pardir, ".env"))


class Config(object):
    SQLALCHEMY_DATABASE_URI = (
        f"postgresql+psycopg2://{os.environ['POSTGRES_USER']}:{os.environ['POSTGRES_PASSWORD']}"
        f"@{os.environ['POSTGRES_SERVER']}:{os.environ['POSTGRES_PORT']}"
        f"/{os.environ['POSTGRES_DB']}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    STORAGE_PROTOCOL = os.getenv("STORAGE_PROTOCOL", "file")
    STORAGE_ROOT = os.getenv("STORAGE_PROTOCOL", "/app/storage/")

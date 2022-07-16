from .internal.database import configure_db_session

SessionLocal = configure_db_session()


def get_db():
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

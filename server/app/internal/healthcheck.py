from app.internal.logging import get_logger
from app.schemas.health import AppHealth
from sqlalchemy.orm import Session

logger = get_logger(__name__)


class Healthcheck:
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    def health(self) -> AppHealth:
        return AppHealth.from_fields(db_healthy=self.__is_db_healthy(), api_healthy=self.__is_api_healthy())

    def __is_db_healthy(self) -> bool:
        try:
            self.db_session.execute("SELECT 1")
        except Exception:
            logger.exception("Database health failed")
            return False
        return True

    def __is_api_healthy(self) -> bool:
        return True

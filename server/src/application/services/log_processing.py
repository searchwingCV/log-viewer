import os
import typing as t

from application.services import FileService, FlightService
from common.logging import get_logger
from domain import ID_Type
from domain.flight.entities import FlightComputedUpdate
from domain.flight_file.value_objects import AllowedFiles
from infrastructure.db.session import SessionContextManager
from infrastructure.repositories.mavlink_timeseries import MavLinkTimeseriesRepository
from pymavlog import MavLog

logger = get_logger(__name__)
basedir = os.path.dirname(__file__)
tmp_dir = os.path.join(basedir, os.pardir, os.pardir, os.pardir, "tmp", "cache", "logs")


class LogProcessingService:
    def __init__(
        self,
        file_service: FileService,
        flight_service: FlightService,
        mavlink_timeseries_repository: MavLinkTimeseriesRepository,
        session: SessionContextManager = SessionContextManager(),
        tmp_dir: str = tmp_dir,
    ):
        self._file_service = file_service
        self._flight_service = flight_service
        self._mavlink_timeseries_repository = mavlink_timeseries_repository
        self._session = session
        self._tmp_dir = tmp_dir

    def process_flight_duration(self, flight_id: ID_Type) -> dict:
        logger.info(f"updating flight duration for flight: {flight_id}")

        mlog = self._read_and_parse_log(flight_id=flight_id, types=["BAT"])

        flight_updates = FlightComputedUpdate(
            id=flight_id,
            log_end_time=mlog.end_timestamp,
            log_start_time=mlog.start_timestamp,
            log_duration=mlog.end_timestamp - mlog.start_timestamp,
        )

        logger.info(f"updating db with values  -> {flight_updates.dict(exclude_none=True)}")

        self._flight_service.update(flight_updates)

        logger.info("success")
        return flight_updates.json(exclude_none=True)

    def _read_and_parse_log(self, flight_id: ID_Type, types: t.List[str] | None, max_rate: float = None) -> MavLog:
        iofile = self._file_service.get_by_flight_id_type(flight_id, AllowedFiles.log)

        logger.debug(f"grabbing log file {iofile.flight_file.id}")
        tmp_path = f"{self._tmp_dir}/file.bin"
        with open(tmp_path, "wb+") as f:
            f.write(iofile.io.getbuffer())

        mlog = MavLog(filepath=tmp_path, types=types, to_datetime=True, max_rate_hz=max_rate)
        mlog.parse()
        return mlog

    def save_timeseries(self, flight_id: ID_Type, max_rate: float) -> dict:
        logger.info(f"processing timeseries for flight: {flight_id}")

        mlog = self._read_and_parse_log(flight_id=flight_id, types=None, max_rate=max_rate)
        logger.info(f"deleting previous values for flight: {flight_id}")

        with self._session as session:
            self._mavlink_timeseries_repository.delete_by_flight_id(session=session, flight_id=flight_id)

        errors = []

        for message_type in mlog.types:
            logger.info(f"inserting timeseries for message type: {message_type}")
            with self._session as session:
                try:
                    self._mavlink_timeseries_repository.bulk_insert(session, flight_id, mlog[message_type])
                except Exception as e:
                    logger.exception(f"error inserting timeseries for message type: {message_type}")
                    errors.append({"message_type": message_type, "error": str(e)})
                    pass

        logger.info("done")
        return {"success": not bool(errors), "errors": errors}

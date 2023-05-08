import os
import typing as t

from application.services import FileService, FlightService
from common.logging import get_logger
from domain import ID_Type
from domain.flight.entities import FlightComputedUpdate
from domain.flight_file.value_objects import AllowedFiles
from pymavlog import MavLog

logger = get_logger(__name__)
basedir = os.path.dirname(__file__)
tmp_dir = os.path.join(basedir, os.pardir, os.pardir, os.pardir, "tmp", "cache", "logs")

print(tmp_dir)


class LogProcessingService:
    def __init__(self, file_service: FileService, flight_service: FlightService, tmp_dir: str = tmp_dir):
        self._file_service = file_service
        self._flight_service = flight_service
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

    def _read_and_parse_log(self, flight_id: ID_Type, types: t.List[str]) -> MavLog:
        iofile = self._file_service.get_by_flight_id_type(flight_id, AllowedFiles.log)

        logger.debug(f"grabbing log file {iofile.flight_file.id}")
        tmp_path = f"{self._tmp_dir}/file.bin"
        with open(tmp_path, "wb+") as f:
            f.write(iofile.io.getbuffer())

        mlog = MavLog(filepath=tmp_path, types=types, to_datetime=True)
        mlog.parse()
        return mlog

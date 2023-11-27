import os
import typing as t
from datetime import datetime

from application.services import FileService, FlightService
from common.logging import get_logger
from domain import ID_Type
from domain.flight.entities import FlightComputedUpdate
from domain.flight_file.value_objects import AllowedFiles
from domain.mavlink_timeseries.entities import MavLinkFlightMessageProperties, MavLinkTimeseries
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
        self._tasks = {
            "save_to_timeseries": self._mavlog_to_timeseries,
            "process_flight_duration": self._flight_duration_from_mavlog,
            "process_battery": self._process_battery_from_mavlog,
        }

    def parse_log_file(self, flight_id: ID_Type, types: t.List[str] | None, max_rate_hz: float) -> dict:
        logger.info(f"parsing log file for flight: {flight_id}")

        logger.info(f"reading log file for {flight_id=}, {types=}, {max_rate_hz=}")
        mlog = self._read_and_parse_log(flight_id=flight_id, types=types, max_rate=max_rate_hz)

        results = []
        for task, fcn in self._tasks.items():
            logger.info(f"running {task}")
            try:
                result = fcn(flight_id, mlog)
                results.append({"task": task, "result": result, "error": None})
            except Exception as e:
                logger.exception(f"running {task} - failed")
                results.append({"task": task, "error": str(e)})
            logger.debug(f"running {task} - done")
        return results

    def process_flight_duration(self, flight_id: ID_Type) -> dict:
        logger.info(f"updating flight duration for flight: {flight_id}")

        mlog = self._read_and_parse_log(flight_id=flight_id, types=["BAT"])

        return self._flight_duration_from_mavlog(flight_id, mlog)

    def _flight_duration_from_mavlog(self, flight_id: ID_Type, mlog: MavLog) -> dict[str, t.Any]:
        flight_updates = FlightComputedUpdate(
            id=flight_id,
            log_end_time=mlog.end_timestamp,
            log_start_time=mlog.start_timestamp,
            log_duration=mlog.end_timestamp - mlog.start_timestamp,
        )
        return self._update(flight_updates)

    def _read_and_parse_log(self, flight_id: ID_Type, types: t.List[str] | None, max_rate: float = None) -> MavLog:
        iofile = self._file_service.get_by_flight_id_type(flight_id, AllowedFiles.log)

        logger.debug(f"grabbing log file {iofile.flight_file.id}")
        tmp_path = f"{self._tmp_dir}/file.bin"
        with open(tmp_path, "wb+") as f:
            f.write(iofile.io.getbuffer())

        mlog = MavLog(filepath=tmp_path, types=types, to_datetime=True, max_rate_hz=max_rate)
        mlog.parse()
        return mlog

    def save_timeseries(self, flight_id: ID_Type, max_rate: float = None) -> dict:
        logger.info(f"processing timeseries for flight: {flight_id}")

        mlog = self._read_and_parse_log(flight_id=flight_id, types=None, max_rate=max_rate)
        return self._mavlog_to_timeseries(flight_id, mlog)

    def _mavlog_to_timeseries(self, flight_id: ID_Type, mlog: MavLog) -> dict[str, t.Any]:
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

    def get_message_properties(self, flight_id: ID_Type) -> MavLinkFlightMessageProperties:
        flight = self._flight_service.get_by_id(flight_id)
        with self._session as session:
            props = self._mavlink_timeseries_repository.get_available_messages_by_group(session, flight_id)
        props.start_timestamp = flight.log_start_time
        props.end_timestamp = flight.log_end_time
        return props

    def get_timeseries(
        self,
        flight_id: ID_Type,
        message_type: str,
        message_field: str,
        start_timestamp: datetime | None = None,
        end_timestamp: datetime | None = None,
        n_points: int | None = None,
    ) -> MavLinkTimeseries:
        with self._session as session:
            timeseries = self._mavlink_timeseries_repository.get_by_flight_type_field(
                session, flight_id, message_type, message_field, start_timestamp, end_timestamp, n_points
            )
        return timeseries

    def _process_battery_from_mavlog(self, flight_id: ID_Type, mlog: MavLog) -> dict[str, t.Any]:
        volt = mlog["BAT"]["Volt"]
        current = mlog["BAT"]["Curr"]
        enrg = mlog["BAT"]["EnrgTot"][-1]
        power = volt * current

        flight_updates = FlightComputedUpdate(
            id=flight_id,
            max_battery_voltage=volt.max(),
            min_battery_voltage=volt.min(),
            delta_battery_voltage=volt.max() - volt.min(),
            avg_battery_current_a=current.mean(),
            max_battery_current_a=current.max(),
            min_battery_current_a=current.min(),
            energy_consumed_wh=enrg,
            avg_power_w=power.mean(),
            max_power_w=power.max(),
            min_power_w=power.min(),
        )
        return self._update(flight_updates)

    def process_battery(self, flight_id: ID_Type) -> dict[str, t.Any]:
        logger.info(f"processing battery for flight: {flight_id}")

        mlog = self._read_and_parse_log(flight_id=flight_id, types=["BAT"])

        return self._process_battery_from_mavlog(flight_id, mlog)

    def _update(self, updates: FlightComputedUpdate) -> dict[str, t.Any]:
        logger.info(f"updating db with values  -> {updates.dict(exclude_none=True)}")
        self._flight_service.update(updates)
        logger.info("success")
        return updates.json(exclude_none=True)

    def process_gps(self, flight_id: ID_Type) -> dict[str, t.Any]:
        logger.info(f"processing gps for flight: {flight_id}")

        mlog = self._read_and_parse_log(flight_id=flight_id, types=["GPS"])

        return self._process_gps_from_mavlog(flight_id, mlog)

    def _process_gps_from_mavlog(self, flight_id: ID_Type, mlog: MavLog) -> dict[str, t.Any]:
        flight_updates = FlightComputedUpdate(
            id=flight_id,
            start_latitude=mlog["GPS"]["Lat"][0],
            start_longitude=mlog["GPS"]["Lng"][0],
            end_latitude=mlog["GPS"]["Lat"][-1],
            end_longitude=mlog["GPS"]["Lng"][-1],
            max_vertical_speed_down_kmh=mlog["GPS"]["VZ"].min(),
            max_vertical_speed_up_kmh=mlog["GPS"]["VZ"].max(),
            max_groundspeed_kmh=mlog["GPS"]["Spd"].max(),
        )
        return self._update(flight_updates)

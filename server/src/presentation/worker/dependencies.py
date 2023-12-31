from application.services import FileService, FlightService, LogProcessingService
from common.config import get_current_config
from infrastructure.repositories import (
    DroneRepository,
    FlightFileRepository,
    FlightRepository,
    MavLinkTimeseriesRepository,
    MissionRepository,
)
from infrastructure.storage import Storage

config = get_current_config()


def get_log_processing_service():
    return LogProcessingService(
        file_service=FileService(
            repository=FlightFileRepository(),
            flight_repository=FlightRepository(),
            storage=Storage(
                rootpath=config.STORAGE_ROOT,
                protocol=config.STORAGE_PROTOCOL,
                options={option: value for option, value in config.STORAGE_OPTIONS.items() if option is not None},
            ),
        ),
        flight_service=FlightService(
            drone_repository=DroneRepository(),
            mission_repository=MissionRepository(),
            repository=FlightRepository(),
            mavlink_timeseries_repository=MavLinkTimeseriesRepository(),
            file_repository=FlightFileRepository(),
            storage=Storage(
                rootpath=config.STORAGE_ROOT,
                protocol=config.STORAGE_PROTOCOL,
                options={option: value for option, value in config.STORAGE_OPTIONS.items() if option is not None},
            ),
        ),
        mavlink_timeseries_repository=MavLinkTimeseriesRepository(),
    )

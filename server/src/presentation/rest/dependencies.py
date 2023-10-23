from application.services import DroneService, FileService, FlightService, LogProcessingService, MissionService
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


def get_file_service():
    yield FileService(
        repository=FlightFileRepository(),
        flight_repository=FlightRepository(),
        storage=Storage(
            rootpath=config.STORAGE_ROOT,
            protocol=config.STORAGE_PROTOCOL,
            options={option: value for option, value in config.STORAGE_OPTIONS.items() if option is not None},
        ),
    )


def get_drone_service():
    yield DroneService(repository=DroneRepository())


def get_flight_service():
    yield FlightService(
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
    )


def get_mission_service():
    yield MissionService(repository=MissionRepository())


def get_log_processing_service():
    yield LogProcessingService(
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

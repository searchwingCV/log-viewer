from application.services import FileService, FlightService, MissionService, PlaneService
from common.config import get_current_config
from infrastructure.repositories import FlightFileRepository, FlightRepository, MissionRepository, PlaneRepository
from infrastructure.storage import Storage

config = get_current_config()


def get_file_service():
    yield FileService(repository=FlightFileRepository(), storage=Storage(config.STORAGE_ROOT, config.STORAGE_PROTOCOL))


def get_plane_service():
    yield PlaneService(repository=PlaneRepository())


def get_flight_service():
    yield FlightService(
        plane_repository=PlaneRepository(), mission_repository=MissionRepository(), repository=FlightRepository()
    )


def get_mission_service():
    yield MissionService(repository=MissionRepository())

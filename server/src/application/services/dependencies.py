from application.services import DroneService, FileService, FlightService, MissionService
from common.config import get_current_config
from infrastructure.repositories import DroneRepository, FlightFileRepository, FlightRepository, MissionRepository
from infrastructure.storage import Storage

config = get_current_config()


def get_file_service():
    yield FileService(repository=FlightFileRepository(), storage=Storage(config.STORAGE_ROOT, config.STORAGE_PROTOCOL))


def get_drone_service():
    yield DroneService(repository=DroneRepository())


def get_flight_service():
    yield FlightService(
        drone_repository=DroneRepository(), mission_repository=MissionRepository(), repository=FlightRepository()
    )


def get_mission_service():
    yield MissionService(repository=MissionRepository())
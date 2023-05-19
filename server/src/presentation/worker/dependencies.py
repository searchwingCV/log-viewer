from application.services import FileService, FlightService, LogProcessingService
from common.config import get_current_config
from infrastructure.repositories import DroneRepository, FlightFileRepository, FlightRepository, MissionRepository
from infrastructure.storage import Storage

config = get_current_config()


def get_log_processing_service():
    return LogProcessingService(
        file_service=FileService(
            repository=FlightFileRepository(),
            flight_repository=FlightRepository(),
            storage=Storage(config.STORAGE_ROOT, config.STORAGE_PROTOCOL),
        ),
        flight_service=FlightService(
            drone_repository=DroneRepository(), mission_repository=MissionRepository(), repository=FlightRepository()
        ),
    )

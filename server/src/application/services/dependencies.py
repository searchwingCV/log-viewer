from application.services import DroneService, FileService, FlightService, MissionService
from infrastructure.repositories import DroneRepository, FlightRepository, MissionRepository


def get_file_service():
    yield FileService()


def get_drone_service():
    yield DroneService(repository=DroneRepository())


def get_flight_service():
    yield FlightService(
        drone_repository=DroneRepository(), mission_repository=MissionRepository(), repository=FlightRepository()
    )


def get_mission_service():
    yield MissionService(repository=MissionRepository())

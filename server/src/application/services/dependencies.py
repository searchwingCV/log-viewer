from application.services import FileService, FlightService, MissionService, PlaneService
from infrastructure.repositories import FlightRepository, MissionRepository, PlaneRepository


def get_file_service():
    yield FileService()


def get_plane_service():
    yield PlaneService(repository=PlaneRepository())


def get_flight_service():
    yield FlightService(
        plane_repository=PlaneRepository(), mission_repository=MissionRepository(), repository=FlightRepository()
    )


def get_mission_service():
    yield MissionService(repository=MissionRepository())

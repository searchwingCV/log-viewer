from domain.drone.entities import BaseDrone, Drone
from presentation.rest.serializers import APISerializer


class CreateDroneSerializer(APISerializer, BaseDrone):
    pass


class DroneSerializer(APISerializer, Drone):
    pass


class FlightDeletion(APISerializer):
    msg: str
    flight_id: int

from domain import EntityID
from domain.drone.entities import BaseDrone, Drone
from domain.drone.entities import DroneUpdate as IDroneUpdate
from presentation.rest.serializers import APISerializer


class CreateDroneSerializer(APISerializer, BaseDrone):
    pass


class DroneSerializer(APISerializer, Drone):
    pass


class DroneUpdate(IDroneUpdate, EntityID, APISerializer):
    pass


class FlightDeletion(APISerializer):
    msg: str
    flight_id: int

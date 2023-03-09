from domain.plane.entities import BasePlane, Plane
from presentation.rest.serializers import APISerializer


class CreatePlaneSerializer(APISerializer, BasePlane):
    pass


class PlaneSerializer(APISerializer, Plane):
    pass


class FlightDeletion(APISerializer):
    msg: str
    flight_id: int

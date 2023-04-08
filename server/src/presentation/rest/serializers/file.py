from domain.flight_file.entities import FlightFile
from presentation.rest.serializers import APISerializer


class FlightFileSerializer(APISerializer, FlightFile):
    pass

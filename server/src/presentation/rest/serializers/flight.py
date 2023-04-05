from domain import EntityID
from domain.flight.entities import Flight
from domain.flight.entities import FlightUpdate as IFlightUpdate
from domain.flight.entities import IBaseFlight
from presentation.rest.serializers import APISerializer


class CreateFlightSerializer(IBaseFlight, APISerializer):
    pass


class FlightSerializer(Flight, APISerializer):
    pass


class FlightUpdate(IFlightUpdate, EntityID, APISerializer):
    pass

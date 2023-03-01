from domain.mission.entities import BaseMission, Mission
from presentation.rest.serializers import APIGeoSerializer, APISerializer, GeoPoint


class MissionSerializer(Mission, APISerializer):
    pass


class CreateMissionSerializer(APIGeoSerializer, BaseMission):
    pass


class MissionSchemaGeo(MissionSerializer, GeoPoint):
    pass


class MissionDeletion(APISerializer):
    msg: str
    id: int

from domain import EntityID
from domain.mission.entities import BaseMission, Mission
from domain.mission.entities import MissionUpdate as IMissionUpdate
from presentation.rest.serializers import APIGeoSerializer, APISerializer, GeoPoint


class MissionSerializer(Mission, APISerializer):
    pass


class CreateMissionSerializer(APIGeoSerializer, BaseMission):
    pass


class MissionSchemaGeo(MissionSerializer, GeoPoint):
    pass


class MissionUpdate(APISerializer, IMissionUpdate, EntityID):
    pass

from typing import Annotated, List, Union

from application.services import LogProcessingService
from common.logging import get_logger
from domain.types import ID_Type
from fastapi import APIRouter, Depends, Query, status
from presentation.rest.dependencies import get_log_processing_service
from presentation.rest.serializers.mavlink import MavLinkFlightMessagePropertiesSerializer

logger = get_logger(__name__)
ROUTE_PREFIX = "/mavlink"
router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=["mavlink"],
    responses={404: {"description": "Not found"}},
)


@router.get(
    "/message-properties",
    status_code=status.HTTP_200_OK,
    response_model=List[MavLinkFlightMessagePropertiesSerializer],
    response_model_exclude_none=True,
)
def get_message_properties(
    flight_id: Annotated[Union[List[ID_Type], None], Query()] = [],
    log_processing_service: LogProcessingService = Depends(get_log_processing_service),
):
    response = []
    for id in flight_id:
        props = log_processing_service.get_message_properties(id)
        response.append(MavLinkFlightMessagePropertiesSerializer.from_orm(props))
    return response

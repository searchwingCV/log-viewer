from datetime import datetime
from typing import Annotated, List, Union

from application.services import LogProcessingService
from common.logging import get_logger
from domain.types import ID_Type
from fastapi import APIRouter, Depends, HTTPException, Query, status
from presentation.rest.dependencies import get_log_processing_service
from presentation.rest.serializers.mavlink import MavLinkFlightMessagePropertiesSerializer, MavLinkTimeseriesSerializer

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


@router.get(
    "/timeseries",
    status_code=status.HTTP_200_OK,
    response_model=List[MavLinkTimeseriesSerializer],
    response_model_exclude_none=True,
)
def get_timeseries(
    flight_id: ID_Type,
    message_types: Annotated[List[str], Query()],
    message_fields: Annotated[List[str], Query()],
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    n_points: Annotated[List[int] | None, Query()] = None,
    log_processing_service: LogProcessingService = Depends(get_log_processing_service),
):
    cond = True
    cond = cond and len(message_types) == len(message_fields)
    cond = cond and len(message_types) == len(n_points) if n_points is not None else cond

    if not cond:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="message_types, n_points and message_fields must have the same length",
        )

    timeseries = []

    for message_type, message_field, n in zip(message_types, message_fields, n_points):
        timeseries.append(
            MavLinkTimeseriesSerializer.from_orm(
                log_processing_service.get_timeseries(flight_id, message_type, message_field, start_time, end_time, n)
            )
        )

    return timeseries

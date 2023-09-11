from typing import Annotated, Union

from application.services.file import FileService
from application.services.flight import FlightService
from common.constants import DEFAULT_PAGE_LEN
from common.exceptions.db import NotFoundException
from common.logging import get_logger
from domain.flight_file.value_objects import AllowedFiles
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, UploadFile, status
from presentation.rest.dependencies import get_file_service, get_flight_service
from presentation.rest.mixins import CRUDMixin
from presentation.rest.serializers import Page, Params, UpdateSerializer
from presentation.rest.serializers.errors import EntityNotFoundError, InvalidPayloadError
from presentation.rest.serializers.file import FlightFileSerializer
from presentation.rest.serializers.flight import CreateFlightSerializer, FlightSerializer, FlightUpdate
from presentation.rest.serializers.responses import BatchUpdateResponse, FlightFilesListResponse
from presentation.worker.tasks import parse_log_file

ROUTE_PREFIX = "/flight"
router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=["flight"],
    responses={404: {"description": "Not found"}},
)

logger = get_logger(__name__)


@router.post("", response_model=FlightSerializer, status_code=status.HTTP_201_CREATED)
async def add_flight(
    flight: CreateFlightSerializer,
    flight_service: FlightService = Depends(get_flight_service),
):
    try:
        return FlightSerializer.from_orm(flight_service.create(flight))
    except NotFoundException as e:
        error = InvalidPayloadError(detail=str(e))
        return Response(status_code=status.HTTP_400_BAD_REQUEST, content=error.json())


@router.get("", response_model=Page[FlightSerializer], status_code=status.HTTP_200_OK)
async def retrieve_all_flights(
    page: Union[int, None] = Query(default=1),
    size: Union[int, None] = Query(default=DEFAULT_PAGE_LEN),
    flight_service: FlightService = Depends(get_flight_service),
):
    total, flights = flight_service.get_all_with_pagination(page, size)
    return Page.create(
        items=flights,
        total=total,
        params=Params(page=page, size=size, path=ROUTE_PREFIX),
    )


@router.get("/{id}", response_model=FlightSerializer, status_code=status.HTTP_200_OK)
async def retrieve_flight(id: int, flight_service: FlightService = Depends(get_flight_service)):
    flight = flight_service.get_by_id(id)
    if not flight:
        return Response(
            status_code=status.HTTP_404_NOT_FOUND,
            content=EntityNotFoundError(id=id).json(),
        )
    return flight


@router.patch(
    "",
    response_model=BatchUpdateResponse[FlightSerializer],
    status_code=status.HTTP_200_OK,
    description="Update flights in batch",
)
async def update_flight(
    flights_to_update: UpdateSerializer[FlightUpdate],
    flight_service: FlightService = Depends(get_flight_service),
):
    response = CRUDMixin.update_items(flights_to_update, flight_service)
    return response


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flight(id: int, flight_service: FlightService = Depends(get_flight_service)):
    flight_service.delete_by_id(id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/{id}/file", status_code=status.HTTP_200_OK, response_model=FlightFileSerializer)
def upload_file(
    id: int,
    file: UploadFile,
    file_type: Annotated[AllowedFiles, Query()],
    process: bool = True,
    file_service: FileService = Depends(get_file_service),
):
    try:
        uploaded_file = file_service.upload_file(id, file, file_type)
        if file_type == AllowedFiles.log and process:
            parse_log_file.delay(id)
        return uploaded_file
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="flight does not exist",
        )


@router.delete("/file/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: int,
    file_service: FileService = Depends(get_file_service),
):
    file_service.delete_file(file_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{id}/file", response_model=FlightFilesListResponse)
def list_files(
    id: int,
    request: Request,
    file_service: FileService = Depends(get_file_service),
):
    result = file_service.list_all_files(id)
    return FlightFilesListResponse.build_from_records(result, id, request.base_url)

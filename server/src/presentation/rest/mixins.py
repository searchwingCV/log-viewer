import typing as t

from application.services.base import BaseCRUDService
from application.services.file import FileService
from application.services.flight import FlightService
from common.constants import FLIGHT_ROUTE_PREFIX
from common.exceptions.db import DuplicatedKeyError, ForeignKeyNotFound
from common.logging import get_logger
from presentation.rest.serializers import APISerializer, Page, Params, UpdateSerializer
from presentation.rest.serializers.errors import EntityNotFoundError, UniqueViolationError, UnprocessableEntityError
from presentation.rest.serializers.responses import (
    BatchUpdateResponse,
    FlightFilesListResponse,
    FlightWithFilesResponse,
)

logger = get_logger(__name__)
T = t.TypeVar("T", bound=APISerializer)


class CRUDMixin:
    @staticmethod
    def update_items(
        items_to_update: UpdateSerializer[T],
        service: BaseCRUDService,
    ) -> BatchUpdateResponse[T]:
        response = BatchUpdateResponse(items=[])
        for entry in items_to_update.items:
            try:
                updated_item = service.update(entry)
            except DuplicatedKeyError:
                response.errors.append(
                    UniqueViolationError(id=entry.id, detail=f"The resource name already exists -> {entry}")
                )
                continue
            except ForeignKeyNotFound:
                foreign_keys = entry.get_foreign_keys()
                response.errors.append(
                    UnprocessableEntityError(id=entry.id, detail=f"one or more references do not exist: {foreign_keys}")
                )
                continue

            if updated_item is None:
                response.errors.append(
                    EntityNotFoundError(
                        id=entry.id,
                        detail=f"{service._entity_type.capitalize()} not found",
                    )
                )
            else:
                response.items.append(updated_item)
        response.set_success()
        return response


class FlightMixin(CRUDMixin):
    @staticmethod
    def get_paginated_flights_with_files(
        page: int,
        size: int,
        flight_service: FlightService,
        file_service: FileService,
    ) -> Page[FlightWithFilesResponse]:
        total, flights = flight_service.get_all_with_pagination(page, size)
        flights = [FlightWithFilesResponse.from_orm(flight_obj) for flight_obj in flights]

        for flight_obj in flights:
            files = file_service.list_all_files(flight_obj.id)
            flight_obj.files = FlightFilesListResponse.build_from_records(files, flight_obj.id)
        page = Page.create(
            items=flights,
            total=total,
            params=Params(page=page, size=size, path=FLIGHT_ROUTE_PREFIX),
        )
        return page

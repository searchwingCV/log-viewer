import typing as t

from application.services.base import BaseCRUDService
from common.logging import get_logger
from presentation.rest.serializers import APISerializer, UpdateSerializer
from presentation.rest.serializers.errors import EntityNotFoundError
from presentation.rest.serializers.responses import BatchUpdateResponse

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
            updated_item = service.update(entry)
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

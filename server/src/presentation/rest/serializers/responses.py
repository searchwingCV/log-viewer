from abc import ABC
from typing import Generic, List, Sequence, TypeVar

from presentation.rest.serializers.errors import UnprocessableEntityError
from pydantic import Field
from pydantic.generics import GenericModel

T = TypeVar("T")


class BatchUpdateResponse(GenericModel, Generic[T], ABC):
    success: bool = Field(default=True)
    items: Sequence[T]
    errors: List[UnprocessableEntityError] = Field(default=[])

    def set_success(self):
        if self.errors:
            self.success = False

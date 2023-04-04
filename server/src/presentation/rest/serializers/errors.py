from enum import Enum

from domain import EntityID
from presentation.rest.serializers import APISerializer


class ErrorCodes(Enum):
    invalid_payload = "invalid-payload"
    not_found = "not-found"
    internal_error = "internal-error"


class APIError(APISerializer):
    title: str
    code: ErrorCodes
    detail: str


class NotFoundError(APIError):
    title: str = "Resource not found"
    code: ErrorCodes = ErrorCodes.not_found
    detail: str = "The resource you were looking does not exist"


class InternalServerError(APIError):
    title: str = "Internal Server Error"
    code: ErrorCodes = ErrorCodes.internal_error


class UnprocessableEntityError(APIError, EntityID):
    pass


class EntityNotFoundError(NotFoundError, EntityID):
    pass


class InvalidPayloadError(APIError):
    title: str = "Invalid payload"
    code: ErrorCodes = ErrorCodes.invalid_payload

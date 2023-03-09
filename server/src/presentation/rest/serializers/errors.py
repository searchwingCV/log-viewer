from enum import Enum

from presentation.rest.serializers import APISerializer


class ErrorCodes(Enum):
    invalid_payload = "invalid-payload"
    not_found = "not-found"


class ClientError(APISerializer):
    title: str
    code: ErrorCodes
    detail: str


class NotFoundError(ClientError):
    title: str = "Resource not found"
    code: ErrorCodes = ErrorCodes.not_found
    detail: str = "The resource you were looking does not exist"


class InvalidPayloadError(ClientError):
    title: str = "Invalid payload"
    code: ErrorCodes = ErrorCodes.invalid_payload

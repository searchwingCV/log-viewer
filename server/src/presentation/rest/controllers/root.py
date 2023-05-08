from common.logging import get_logger
from fastapi import APIRouter, Request

router = APIRouter(
    prefix="",
    tags=["root"],
    responses={404: {"description": "Not found"}},
    include_in_schema=False,
)

logger = get_logger(__name__)


@router.get("/", description="Welcome")
async def main(request: Request):
    return {"msg": f"Welcome to the Searchiwng Log API! To check the docs please visit: {request.url._url}docs"}

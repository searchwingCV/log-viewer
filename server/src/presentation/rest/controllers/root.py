from celery.result import AsyncResult
from common.logging import get_logger
from fastapi import APIRouter, Body, Request
from fastapi.responses import JSONResponse
from presentation.worker.tasks import say_hello

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


@router.post("/async")
def hello(payload=Body(...)):
    name: str = payload["name"]
    task = say_hello.delay(name)
    return JSONResponse({"task_id": task.id})


@router.get("/task/{task_id}")
def get_status(task_id):
    task_result = AsyncResult(task_id)
    result = {"task_id": task_id, "task_status": task_result.status, "task_result": task_result.result}
    return JSONResponse(result)

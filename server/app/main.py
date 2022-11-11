import os

import strawberry
from app.dependencies import get_storage
from app.internal.database import configure_db_session
from app.internal.storage import Storage
from app.routers import flight, log, mission, plane, status
from app.schemas.graph_queries import Mutation, Query
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from strawberry.fastapi import GraphQLRouter

app = FastAPI(
    title="Searchwing flight log data API",
    description="An API to keep log files organized and analyze them",
)


@app.get("/", description="Welcome")
async def main(request: Request):
    return {"msg": f"Welcome to the Searchiwng Log API! To check the docs please visit: {request.url._url}docs"}


@app.get("/file")
async def get_file_from_uri(uri: str, storage: Storage = Depends(get_storage)):
    path = uri.replace(f"{storage.protocol}://", "")
    if storage.protocol == "file":
        if os.path.isfile(path):
            return FileResponse(path, filename=os.path.basename(path))
        else:
            raise HTTPException(404, "File not found")
    else:
        raise HTTPException(501, f"Not implemented -> {storage.protocol=}")


schema = strawberry.Schema(Query, Mutation)

graphql_app = GraphQLRouter(schema)

app.include_router(status.router)
app.include_router(plane.router)
app.include_router(mission.router)
app.include_router(flight.router)
app.include_router(log.router)
app.include_router(graphql_app, prefix="/graphql-meta")

SessionLocal = configure_db_session()

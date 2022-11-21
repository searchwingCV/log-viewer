import strawberry
from app.internal.database import configure_db_session
from app.routers import file, flight, mission, plane, status
from app.schemas.graph_queries import Mutation, Query
from fastapi import FastAPI, Request
from strawberry.fastapi import GraphQLRouter

app = FastAPI(
    title="Searchwing flight log data API",
    description="An API to keep log files organized and analyze them",
)


@app.get("/", description="Welcome")
async def main(request: Request):
    return {"msg": f"Welcome to the Searchiwng Log API! To check the docs please visit: {request.url._url}docs"}


schema = strawberry.Schema(Query, Mutation)

graphql_app = GraphQLRouter(schema)

app.include_router(status.router)
app.include_router(plane.router)
app.include_router(mission.router)
app.include_router(flight.router)
app.include_router(file.router)
app.include_router(graphql_app, prefix="/graphql-meta")

SessionLocal = configure_db_session()

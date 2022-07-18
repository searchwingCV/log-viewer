import strawberry
from app.schemas.graph_queries import Query, Mutation
from strawberry.fastapi import GraphQLRouter

from fastapi import FastAPI, Request
from app.routers import status, plane
from app.internal.database import configure_db_session



app = FastAPI(
    title="Searchwing flight log data API",
    description="An API to keep log files organized and analyze them",
)



@app.get("/")
async def main(request: Request):
    return {
        "msg": f"Welcome to the Searchiwng Log API! To check the docs please visit: {request.url._url}docs"
    }

schema = strawberry.Schema(Query, Mutation)

graphql_app = GraphQLRouter(schema)

app.include_router(status.router)
app.include_router(plane.router)
app.include_router(graphql_app, prefix="/graphql-meta")

SessionLocal = configure_db_session()

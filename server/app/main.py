import time

import strawberry
from app.config import Config
from app.dependencies import get_db
from app.internal.database import configure_db_session
from app.routers import file, flight, mission, plane, status
from app.schemas.graph_queries import Mutation, Query
from fastapi import Depends, FastAPI, Request
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session
from strawberry.fastapi import GraphQLRouter

app = FastAPI(
    title="Searchwing flight log data API",
    description="An API to keep log files organized and analyze them",
)


@app.get("/", description="Welcome")
async def main(request: Request):
    return {"msg": f"Welcome to the Searchiwng Log API! To check the docs please visit: {request.url._url}docs"}


@app.get("/mavlink-msg/{flight_id}")
async def get_mesage(flight_id: int, message_type: str, db: Session = Depends(get_db)):
    data = db.execute(text(f"SELECT * FROM {message_type}"))
    result = data.mappings().all()
    return result


@app.get("/mavlink-schema")
async def get_schema():
    engine = create_engine(Config.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)
    inspector = inspect(engine)
    tables = {}
    for table_name in inspector.get_table_names():
        tables[table_name] = {}
        for column in inspector.get_columns(table_name):
            tables[table_name][column["name"]] = str(column["type"])
    return tables


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    print("Time took to process the request and return response is {} sec".format(time.time() - start_time))
    return response


schema = strawberry.Schema(Query, Mutation)

graphql_app = GraphQLRouter(schema)

app.include_router(status.router)
app.include_router(plane.router)
app.include_router(mission.router)
app.include_router(flight.router)
app.include_router(file.router)
app.include_router(graphql_app, prefix="/graphql-meta")

SessionLocal = configure_db_session()

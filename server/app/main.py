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


app.include_router(status.router)
app.include_router(plane.router)

SessionLocal = configure_db_session()


# Dependency
def get_db():
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

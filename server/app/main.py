from fastapi import FastAPI
from app.routers import status

app = FastAPI()

app.include_router(status.router)


@app.get("/")
async def root():
    return {"message": "Hello Bigger Applications!"}

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from presentation.rest.controllers import drone, flight, health, mavlink, mission, root


@pytest.fixture(scope="module")
def test_app():
    app = FastAPI()
    app.include_router(root.router)
    app.include_router(health.router)
    app.include_router(drone.router)
    app.include_router(mission.router)
    app.include_router(flight.router)
    app.include_router(mavlink.router)
    yield app


@pytest.fixture(scope="module")
def test_client(test_app):
    client = TestClient(test_app)
    yield client

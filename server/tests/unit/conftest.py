import os
import sys

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir, os.pardir)))

from src.presentation.rest.controllers import flight, health, mission, plane, root  # noqa


@pytest.fixture(scope="module")
def test_app():
    app = FastAPI()
    app.include_router(root.router)
    app.include_router(health.router)
    app.include_router(plane.router)
    app.include_router(mission.router)
    app.include_router(flight.router)
    yield app


@pytest.fixture(scope="module")
def test_client(test_app):
    client = TestClient(test_app)
    yield client

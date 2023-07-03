import os
import sys
from unittest.mock import Mock

import pytest
from application.services import FileService, FlightService, LogProcessingService
from fastapi import FastAPI
from fastapi.testclient import TestClient
from infrastructure.db.session import SessionContextManager
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir, os.pardir)))

from presentation.rest.controllers import drone, flight, health, mission, root  # noqa


@pytest.fixture(scope="module")
def test_app():
    app = FastAPI()
    app.include_router(root.router)
    app.include_router(health.router)
    app.include_router(drone.router)
    app.include_router(mission.router)
    app.include_router(flight.router)
    yield app


@pytest.fixture(scope="module")
def test_client(test_app):
    client = TestClient(test_app)
    yield client


@pytest.fixture(scope="function")
def mock_session():
    session = Mock(spec=Session)
    return session


@pytest.fixture(scope="function")
def mock_session_factory(mock_session):
    session_factory = Mock(spec=SessionContextManager)
    session_factory.__enter__ = mock_session
    session_factory.__exit__ = Mock(return_value=False)
    return session_factory


@pytest.fixture
def mock_flight_service():
    mock_flight_service = Mock(spec=FlightService)
    mock_flight_service._entity_type = "Flight"
    return mock_flight_service


@pytest.fixture
def mock_file_service():
    mock_file_service = Mock(spec=FileService)
    mock_file_service._entity_type = "FileFlight"
    return mock_file_service


@pytest.fixture
def mock_log_processing_service():
    mock_file_service = Mock(spec=LogProcessingService)
    return mock_file_service

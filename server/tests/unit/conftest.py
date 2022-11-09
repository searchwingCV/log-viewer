import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir, os.pardir))
)

from app.main import app  # noqa


@pytest.fixture(scope="module")
def test_client():
    client = TestClient(app)
    yield client

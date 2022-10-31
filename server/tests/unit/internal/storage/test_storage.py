import os
from io import BytesIO

import pytest
from app.internal.storage import Storage

basepath = os.path.join(os.path.dirname(__file__), "mocks", "aux_files")


@pytest.fixture
def storage_obj():
    return Storage(basepath, "file")


@pytest.fixture
def test_stream():
    test_stream = BytesIO()
    test_stream.write(b"test 123")
    test_stream.seek(0)
    yield test_stream


def test_get(storage_obj):
    filebuffer = storage_obj.get("1.txt")
    assert filebuffer.read() == b"test\n"


def test_get_uri(storage_obj):
    expected_uri = f"file://{basepath}/1.txt"
    assert storage_obj.get_uri("1.txt") == expected_uri


def test_save(storage_obj, test_stream):
    storage_obj.save(test_stream, "2.txt")
    assert os.path.isfile(os.path.join(basepath, "2.txt"))
    assert open(os.path.join(basepath, "2.txt")).read() == "test 123"
    os.remove(os.path.join(basepath, "2.txt"))

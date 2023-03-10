import os
import shutil
from io import BytesIO

import pytest
from src.infrastructure.storage import Storage

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


@pytest.mark.parametrize("path", ["2.txt", "folder/2.txt", "folder/folder2/3.txt"])
def test_save(storage_obj, test_stream, path):
    storage_obj.save(test_stream, path)
    assert os.path.isfile(os.path.join(basepath, path))
    assert open(os.path.join(basepath, path)).read() == "test 123"
    if os.path.isfile(os.path.join(basepath, "2.txt")):
        os.remove(os.path.join(basepath, "2.txt"))
    if os.path.isdir(os.path.join(basepath, "folder")):
        shutil.rmtree(os.path.join(basepath, "folder"))


@pytest.mark.parametrize("path", ["2.txt", "folder/2.txt", "folder/folder2/3.txt"])
def test_delete(storage_obj, test_stream, path):
    if not len(path.split("/")) == 1:
        os.makedirs(os.path.join(basepath, "/".join(path.split("/")[:-1])))
    with open(os.path.join(basepath, path), "wb") as f:
        f.write(test_stream.getbuffer())
    storage_obj.delete(path)
    assert not os.path.exists(os.path.join(basepath, path))

    # delete created dirs
    if os.path.isdir(os.path.join(basepath, "folder")):
        shutil.rmtree(os.path.join(basepath, "folder"))

import os
from io import BytesIO

import fsspec
from common.exceptions.storage import UndefinedProtocol
from fsspec import AbstractFileSystem


class Storage:
    def __init__(self, rootpath: str, protocol: str):
        self.rootpath = self.__validate_root(rootpath)
        self.protocol = protocol
        self.fs = self.__get_filesystem()

    def __validate_root(self, root: str) -> str:
        if root.endswith("/"):
            root = root[:-1]
        return root

    def __merge_path(self, key_a: str, key_b: str) -> str:
        key = os.path.join(key_a, key_b)
        if key.endswith("/"):
            key = key[:-1]
        return key

    def __get_filesystem(self) -> AbstractFileSystem:
        try:
            return fsspec.filesystem(self.protocol)
        except (ImportError, ValueError):
            raise UndefinedProtocol(self.protocol)

    def save(self, fileio: BytesIO, filepath: str):
        fullpath = self.__merge_path(self.rootpath, filepath)
        self.fs.makedirs(os.path.dirname(fullpath), exist_ok=True)
        with self.fs.open(fullpath, "wb") as f:
            f.write(fileio.getbuffer())

    def get_uri(self, filepath: str) -> str:
        fullpath = self.__merge_path(self.rootpath, filepath)
        return f"{self.protocol}://{fullpath}"

    def get_path(self, uri: str) -> str:
        return uri.replace(f"{self.protocol}://", "")

    def get(self, filepath: str) -> BytesIO:
        fullpath = self.__merge_path(self.rootpath, filepath)
        with self.fs.open(fullpath, "rb") as f:
            buf = BytesIO(f.read())
        return buf

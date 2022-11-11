class StorageException(Exception):
    def __init__(self) -> None:
        self.message = "A storage error has occured"

    def __str__(self) -> str:
        return self.message


class UndefinedProtocol(StorageException):
    def __init__(self, protocol):
        self.protocol = protocol
        self.message = f"The following protocol is not recognized -> {self.protocol}"
        super().__init__(self.message)

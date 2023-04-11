class DBException(Exception):
    def __init__(self, table_name, e) -> None:
        self.message = f"An error occurred while communicating with the DB.\ntable name: {table_name}, exception:\n{e}"
        super().__init__(self.message)


class NotFoundException(Exception):
    def __init__(self, id, table_name) -> None:
        self.table = table_name
        self.message = f"No records are found for id '{id}' in the table '{self.table}'"
        super().__init__(self.message)


class DuplicatedKeyError(Exception):
    def __init__(self, data) -> None:
        self.message = f"This object violates a unique key -> {data}"
        super().__init__(self.message)


class ForeignKeyNotFound(Exception):
    def __init__(self, table_name, data, pgdetail) -> None:
        self.table = table_name
        self.data = data
        self.pgdetail = pgdetail

    def __str__(self) -> str:
        return f"Referenced Foreign Key in {self.table} was not found. Detail: {self.pgdetail}"


class NonRetryableException(Exception):
    ...


class DataToORMSerializationException(NonRetryableException):
    ...

class DBException(Exception):
    def __init__(self, table_name, e) -> None:
        self.message = f"An error occurred while communicating with the DB.\ntable name: {table_name}, exception:\n{e}"
        super().__init__(self.message)


class NotFoundException(Exception):
    def __init__(self, id, table_name) -> None:
        self.message = f"No records are found for id '{id}' in the table '{table_name}'"
        super().__init__(self.message)

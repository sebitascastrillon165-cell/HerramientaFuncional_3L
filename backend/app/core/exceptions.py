class ResourceNotFoundError(LookupError):
    def __init__(self, message: str = "Recurso no encontrado."):
        super().__init__(message)
        self.message = message


class StallFullError(ValueError):
    def __init__(self, message: str = "La pesebrera indicada se encuentra llena."):
        super().__init__(message)
        self.message = message

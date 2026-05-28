from ..repositories.servicio_repository import ServicioRepository

class ServicioService:
    def __init__(self):
        self.repository = ServicioRepository()

    def get_all(self):
        return self.repository.get_all()

    def create(self, data):
        return self.repository.create(data)

    def update(self, id, data):
        return self.repository.update(id, data)

    def delete(self, id):
        return self.repository.delete(id)

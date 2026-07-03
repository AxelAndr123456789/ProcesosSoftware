from ..repositories.reclamo_repository import ReclamoRepository

class ReclamoService:
    def __init__(self):
        self.repository = ReclamoRepository()

    def get_all(self):
        return self.repository.get_all()

    def create(self, data):
        return self.repository.create(data)

    def update(self, id, data):
        return self.repository.update(id, data)

    def delete(self, id):
        return self.repository.delete(id)

    def resolve(self, id):
        return self.repository.resolve(id)

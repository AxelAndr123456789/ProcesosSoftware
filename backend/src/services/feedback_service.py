from ..repositories.feedback_repository import FeedbackRepository

class FeedbackService:
    def __init__(self):
        self.repository = FeedbackRepository()

    def get_all(self):
        return self.repository.get_all()

    def create(self, data):
        return self.repository.create(data)

    def update(self, id, data):
        return self.repository.update(id, data)

    def delete(self, id):
        return self.repository.delete(id)

from fastapi import APIRouter, HTTPException
from ..schemas.feedback import Feedback, FeedbackCreate, FeedbackUpdate
from ..services.feedback_service import FeedbackService
from typing import List

router = APIRouter(prefix="/feedback", tags=["Feedback"])
service = FeedbackService()

@router.get("/", response_model=List[Feedback])
def get_feedback():
    return service.get_all()

@router.post("/")
def create_feedback(data: FeedbackCreate):
    service.create(data)
    return {"message": "Feedback creado exitosamente"}

@router.put("/{id}")
def update_feedback(id: int, data: FeedbackUpdate):
    service.update(id, data)
    return {"message": "Feedback actualizado exitosamente"}

@router.delete("/{id}")
def delete_feedback(id: int):
    service.delete(id)
    return {"message": "Feedback eliminado exitosamente"}

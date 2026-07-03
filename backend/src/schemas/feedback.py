from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FeedbackBase(BaseModel):
    id_reserva: int
    cliente: str
    calificacion: int
    comentario: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackUpdate(FeedbackBase):
    pass

class Feedback(FeedbackBase):
    id_feedback: int
    fecha_feedback: datetime
    cliente_reserva: Optional[str] = None
    nombre_servicio: Optional[str] = None

    class Config:
        from_attributes = True

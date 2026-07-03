from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReclamoBase(BaseModel):
    id_reserva: int
    cliente: str
    motivo: str
    descripcion: Optional[str] = None
    estado: Optional[str] = "Pendiente"

class ReclamoCreate(ReclamoBase):
    pass

class ReclamoUpdate(ReclamoBase):
    pass

class Reclamo(ReclamoBase):
    id_reclamo: int
    fecha_reclamo: datetime
    fecha_resolucion: Optional[datetime] = None
    cliente_reserva: Optional[str] = None
    nombre_servicio: Optional[str] = None

    class Config:
        from_attributes = True

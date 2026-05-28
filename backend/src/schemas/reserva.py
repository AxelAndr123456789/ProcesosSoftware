from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReservaBase(BaseModel):
    cliente: str
    id_servicio: int
    estado_reserva: Optional[str] = "Pendiente"
    estado_pago: Optional[str] = "Pendiente"

class ReservaCreate(ReservaBase):
    pass

class ReservaUpdate(ReservaBase):
    pass

class Reserva(ReservaBase):
    id_reserva: int
    fecha_reserva: datetime
    nombre_servicio: Optional[str] = None

    class Config:
        from_attributes = True

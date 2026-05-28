from pydantic import BaseModel
from typing import Optional

class ServicioBase(BaseModel):
    nombre: str
    destino: str
    inversion: float
    capacidad: int
    id_operador: int
    estado: Optional[str] = "Disponible"

class ServicioCreate(ServicioBase):
    pass

class ServicioUpdate(ServicioBase):
    pass

class Servicio(ServicioBase):
    id_servicio: int
    nombre_operador: Optional[str] = None

    class Config:
        from_attributes = True

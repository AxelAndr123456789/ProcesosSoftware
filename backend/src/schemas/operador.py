from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OperadorBase(BaseModel):
    contacto: str # Nombre de la persona (CONTACTO en la imagen)
    telefono: Optional[str] = None
    estado: Optional[str] = "Activo"

class OperadorCreate(OperadorBase):
    pass

class OperadorUpdate(OperadorBase):
    pass

class Operador(OperadorBase):
    id_operador: int
    fecha_registro: datetime

    class Config:
        from_attributes = True

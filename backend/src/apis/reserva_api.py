from fastapi import APIRouter, HTTPException
from ..schemas.reserva import Reserva, ReservaCreate, ReservaUpdate
from ..services.reserva_service import ReservaService
from typing import List

router = APIRouter(prefix="/reservas", tags=["Reservas"])
service = ReservaService()

@router.get("/", response_model=List[Reserva])
def get_reservas():
    return service.get_all()

@router.post("/")
def create_reserva(data: ReservaCreate):
    service.create(data)
    return {"message": "Reserva creada exitosamente"}

@router.put("/{id}")
def update_reserva(id: int, data: ReservaUpdate):
    service.update(id, data)
    return {"message": "Reserva actualizada exitosamente"}

@router.delete("/{id}")
def delete_reserva(id: int):
    service.delete(id)
    return {"message": "Reserva eliminada exitosamente"}

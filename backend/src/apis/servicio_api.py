from fastapi import APIRouter, HTTPException
from ..schemas.servicio import Servicio, ServicioCreate, ServicioUpdate
from ..services.servicio_service import ServicioService
from typing import List

router = APIRouter(prefix="/servicios", tags=["Servicios"])
service = ServicioService()

@router.get("/", response_model=List[Servicio])
def get_servicios():
    return service.get_all()

@router.post("/")
def create_servicio(data: ServicioCreate):
    service.create(data)
    return {"message": "Servicio creado exitosamente"}

@router.put("/{id}")
def update_servicio(id: int, data: ServicioUpdate):
    service.update(id, data)
    return {"message": "Servicio actualizado exitosamente"}

@router.delete("/{id}")
def delete_servicio(id: int):
    service.delete(id)
    return {"message": "Servicio eliminado exitosamente"}

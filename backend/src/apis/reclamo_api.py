from fastapi import APIRouter, HTTPException
from ..schemas.reclamo import Reclamo, ReclamoCreate, ReclamoUpdate
from ..services.reclamo_service import ReclamoService
from typing import List

router = APIRouter(prefix="/reclamos", tags=["Reclamos"])
service = ReclamoService()

@router.get("/", response_model=List[Reclamo])
def get_reclamos():
    return service.get_all()

@router.post("/")
def create_reclamo(data: ReclamoCreate):
    service.create(data)
    return {"message": "Reclamo creado exitosamente"}

@router.put("/{id}")
def update_reclamo(id: int, data: ReclamoUpdate):
    service.update(id, data)
    return {"message": "Reclamo actualizado exitosamente"}

@router.delete("/{id}")
def delete_reclamo(id: int):
    service.delete(id)
    return {"message": "Reclamo eliminado exitosamente"}

@router.put("/{id}/resolve")
def resolve_reclamo(id: int):
    service.resolve(id)
    return {"message": "Reclamo marcado como resuelto"}

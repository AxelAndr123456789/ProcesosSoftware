from fastapi import APIRouter, HTTPException
from ..schemas.operador import Operador, OperadorCreate, OperadorUpdate
from ..services.operador_service import OperadorService
from typing import List

router = APIRouter(prefix="/operadores", tags=["Operadores"])
service = OperadorService()

@router.get("/", response_model=List[Operador])
def get_operadores():
    return service.get_all()

@router.post("/")
def create_operador(data: OperadorCreate):
    service.create(data)
    return {"message": "Operador creado exitosamente"}

@router.put("/{id}")
def update_operador(id: int, data: OperadorUpdate):
    service.update(id, data)
    return {"message": "Operador actualizado exitosamente"}

@router.delete("/{id}")
def delete_operador(id: int):
    service.delete(id)
    return {"message": "Operador eliminado exitosamente"}

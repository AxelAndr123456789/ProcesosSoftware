from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(data: LoginRequest):
    # Por ahora validación simple igual que en el frontend
    if data.email == "admin@horizoncurator.com" and data.password == "admin123":
        return {"success": True, "token": "dummy-token-123", "user": {"email": data.email, "role": "admin"}}
    raise HTTPException(status_code=401, detail="Credenciales incorrectas")

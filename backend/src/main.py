from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .apis.operador_api import router as operador_router
from .apis.servicio_api import router as servicio_router
from .apis.reserva_api import router as reserva_router
from .apis.auth_api import router as auth_router
from .apis.reclamo_api import router as reclamo_router
from .apis.feedback_api import router as feedback_router
import os

app = FastAPI(title="Horizon System API", version="1.0.0")
app.router.redirect_slashes = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request, call_next):
    import time
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

app.include_router(operador_router)
app.include_router(servicio_router)
app.include_router(reserva_router)
app.include_router(auth_router)
app.include_router(reclamo_router)
app.include_router(feedback_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Horizon System API"}

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("src.main:app", host="0.0.0.0", port=port)

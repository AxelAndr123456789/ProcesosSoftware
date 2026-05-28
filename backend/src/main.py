from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .apis.operador_api import router as operador_router
from .apis.servicio_api import router as servicio_router
from .apis.reserva_api import router as reserva_router
from .apis.auth_api import router as auth_router

app = FastAPI(title="Horizon System API", version="1.0.0")
app.router.redirect_slashes = False

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware personalizado para logging de peticiones
@app.middleware("http")
async def add_process_time_header(request, call_next):
    import time
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    print(f"Request: {request.method} {request.url.path} - Time: {process_time:.4f}s")
    return response

# Registrar rutas
app.include_router(operador_router)
app.include_router(servicio_router)
app.include_router(reserva_router)
app.include_router(auth_router)

# Configurar routers para no ser estrictos con las barras diagonales
for route in app.routes:
    if hasattr(route, "endpoint") and hasattr(route, "path"):
        pass # Esto ya se maneja a nivel de inclusion si usamos strict_slashes=False en cada uno

@app.get("/")
def read_root():
    return {"message": "Welcome to Horizon System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="127.0.0.1", port=8000, reload=True)

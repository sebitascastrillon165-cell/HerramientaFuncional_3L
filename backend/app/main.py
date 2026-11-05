from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.database import backup_database, init_db
from app.routers import animals, dashboard, montadores, pesebreras, tarifas


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    backup_database()


app = FastAPI(
    title="Pesebrera3L-Desk API",
    version="1.0.0",
    description="API REST local para la gestion integral de la pesebrera 3L.",
    lifespan=lifespan,
)

app.include_router(pesebreras.router)
app.include_router(animals.router)
app.include_router(montadores.router)
app.include_router(tarifas.router)
app.include_router(dashboard.router)


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}
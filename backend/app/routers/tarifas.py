from fastapi import APIRouter
from app.database import db_session
from app.schemas import TarifaCreate, TarifaUpdate
from app.services import tariffs_service

router = APIRouter(prefix="/api/v1/tarifas", tags=["tarifas"])


@router.get("/")
def listar_tarifas():
    with db_session() as conn:
        return tariffs_service.list_tarifas(conn)


@router.post("/")
def crear_tarifa(payload: TarifaCreate):
    with db_session() as conn:
        return tariffs_service.create_tarifa(conn, payload.nombre, payload.precio)


@router.put("/{tarifa_id}")
def actualizar_tarifa(tarifa_id: int, payload: TarifaUpdate):
    with db_session() as conn:
        return tariffs_service.update_tarifa(conn, tarifa_id, payload.nombre, payload.precio)
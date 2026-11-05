from fastapi import APIRouter
from app.database import db_session
from app.schemas import MontadorCreate, MontadorUpdate
from app.services import riders_service

router = APIRouter(prefix="/api/v1/montadores", tags=["montadores"])


@router.get("/")
def listar_montadores():
    with db_session() as conn:
        return riders_service.list_montadores(conn)


@router.post("/")
def crear_montador(payload: MontadorCreate):
    with db_session() as conn:
        return riders_service.create_montador(conn, payload.model_dump())


@router.put("/{montador_id}")
def actualizar_montador(montador_id: int, payload: MontadorUpdate):
    with db_session() as conn:
        return riders_service.update_montador(conn, montador_id, payload.model_dump())
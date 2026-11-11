from fastapi import APIRouter, HTTPException
from app.core.exceptions import ResourceNotFoundError
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
        try:
            return riders_service.update_montador(conn, montador_id, payload.model_dump())
        except ResourceNotFoundError as exc:
            raise HTTPException(status_code=404, detail=exc.message)


@router.delete("/{montador_id}")
def eliminar_montador(montador_id: int):
    with db_session() as conn:
        try:
            return riders_service.delete_montador(conn, montador_id)
        except ResourceNotFoundError as exc:
            raise HTTPException(status_code=404, detail=exc.message)

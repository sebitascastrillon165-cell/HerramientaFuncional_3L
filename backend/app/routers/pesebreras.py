from fastapi import APIRouter, HTTPException
import sqlite3
from app.core.exceptions import ResourceNotFoundError
from app.database import db_session
from app.schemas import PesebreraCreate, PesebreraUpdate
from app.services import stables_service

router = APIRouter(prefix="/api/v1/pesebreras", tags=["pesebreras"])


@router.get("/")
def listar_pesebreras():
    with db_session() as conn:
        return stables_service.list_pesebreras(conn)


@router.post("/", status_code=201)
def crear_pesebrera(payload: PesebreraCreate):
    with db_session() as conn:
        try:
            return stables_service.create_pesebrera(conn, payload.nombre, payload.capacidad)
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=409, detail="Ya existe una pesebrera con ese nombre.")


@router.put("/{pesebrera_id}")
def actualizar_pesebrera(pesebrera_id: int, payload: PesebreraUpdate):
    with db_session() as conn:
        try:
            return stables_service.update_pesebrera(conn, pesebrera_id, payload.nombre, payload.capacidad)
        except ResourceNotFoundError:
            raise HTTPException(status_code=404, detail="La pesebrera indicada no existe.")
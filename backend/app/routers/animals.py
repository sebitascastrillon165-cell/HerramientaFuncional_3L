from fastapi import APIRouter, HTTPException
from app.core.exceptions import ResourceNotFoundError, StallFullError
from app.database import db_session
from app.schemas import AnimalCreate, AnimalUpdate
from app.services import animals_service

router = APIRouter(prefix="/api/v1/animales", tags=["animales"])


@router.get("/")
def listar_animales():
    with db_session() as conn:
        return animals_service.list_animales(conn)


@router.post("/", status_code=201)
def crear_animal(payload: AnimalCreate):
    with db_session() as conn:
        try:
            return animals_service.create_animal(conn, payload.model_dump())
        except ResourceNotFoundError as exc:
            raise HTTPException(status_code=404, detail=exc.message)
        except StallFullError as exc:
            raise HTTPException(status_code=409, detail=exc.message)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))


@router.put("/{animal_id}")
def actualizar_animal(animal_id: int, payload: AnimalUpdate):
    with db_session() as conn:
        try:
            return animals_service.update_animal(conn, animal_id, payload.model_dump())
        except ResourceNotFoundError as exc:
            raise HTTPException(status_code=404, detail=exc.message)
        except StallFullError as exc:
            raise HTTPException(status_code=409, detail=exc.message)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/{animal_id}")
def eliminar_animal(animal_id: int):
    with db_session() as conn:
        try:
            return animals_service.delete_animal(conn, animal_id)
        except ResourceNotFoundError as exc:
            raise HTTPException(status_code=404, detail=exc.message)
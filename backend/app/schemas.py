from typing import Optional
from pydantic import BaseModel, Field


class TarifaBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=120)
    precio: float = Field(..., ge=0)


class TarifaCreate(TarifaBase):
    pass


class TarifaUpdate(BaseModel):
    id: int
    nombre: str = Field(..., min_length=1, max_length=120)
    precio: float = Field(..., ge=0)


class PesebreraBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=120)
    capacidad: int = Field(..., ge=1)


class PesebreraCreate(PesebreraBase):
    cantidad: int = Field(default=1, ge=1, le=100)


class PesebreraUpdate(BaseModel):
    id: int
    nombre: str = Field(..., min_length=1, max_length=120)
    capacidad: int = Field(..., ge=1)


class MontadorBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=120)
    telefono: Optional[str] = None
    disponible: bool = True


class MontadorCreate(MontadorBase):
    pass


class MontadorUpdate(BaseModel):
    id: int
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    disponible: Optional[bool] = None


class AnimalBase(BaseModel):
    tipo: str = Field(..., min_length=1, max_length=30)
    nombre: str = Field(..., min_length=1, max_length=120)
    raza: Optional[str] = None
    sexo: str = Field(default="macho", max_length=10)
    pesebrera_id: Optional[int] = None
    montador_id: Optional[int] = None
    estado: str = Field(default="asignado", max_length=20)
    montador_disponible: Optional[bool] = None


class AnimalCreate(AnimalBase):
    pass


class AnimalUpdate(BaseModel):
    id: Optional[int] = None
    tipo: Optional[str] = None
    nombre: Optional[str] = None
    raza: Optional[str] = None
    sexo: Optional[str] = None
    estado: Optional[str] = None
    pesebrera_id: Optional[int] = None
    montador_id: Optional[int] = None
    montador_disponible: Optional[bool] = None
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class CategoriaBase(BaseModel):
    nombre: str = Field(..., min_length=1, example="Pizzas")
    descripcion: str = Field(default="", example="Pizzas napolitanas de masa madre")

    @field_validator("nombre")
    @classmethod
    def validar_nombre_no_vacio(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("El nombre no puede estar vacío")
        return v.strip()


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1)
    descripcion: Optional[str] = None

    @field_validator("nombre")
    @classmethod
    def validar_nombre_no_vacio(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("El nombre no puede estar vacío")
        return v.strip() if v is not None else None


class CategoriaRead(CategoriaBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

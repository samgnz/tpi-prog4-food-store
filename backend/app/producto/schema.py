from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

from app.categoria.schema import CategoriaRead


class ProductoBase(BaseModel):
    nombre: str = Field(..., min_length=1, example="Pizza de Muzzarella")
    descripcion: str = Field(
        default="", example="Pizza con salsa de tomate y queso muzzarella"
    )
    precio_base: float = Field(..., ge=0, example=12500.0)
    imagenes_url: List[str] = Field(
        default_factory=list, examples=[["https://ejemplo.com/pizza.jpg"]]
    )
    disponible: bool = True

    @field_validator("nombre")
    @classmethod
    def validar_nombre_no_vacio(cls, v: str) -> str:
        if not v.strip():
            raise ValueError(
                "El nombre no puede quedar vacío ni contener solo espacios"
            )
        return v.strip()


class ProductoCreate(ProductoBase):
    categoria_ids: Optional[List[int]] = Field(default=None, examples=[[1]])


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagenes_url: Optional[List[str]] = None
    disponible: Optional[bool] = None
    categoria_ids: Optional[List[int]] = None

    @field_validator("nombre")
    @classmethod
    def validar_nombre_no_vacio(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError(
                "El nombre no puede quedar vacío ni contener solo espacios"
            )
        return v.strip() if v is not None else None


class ProductoRead(ProductoBase):
    id: int
    categorias: List[CategoriaRead] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ProductoCategoriaAssign(BaseModel):
    categoria_id: int = Field(..., gt=0, example=1)
    es_principal: bool = Field(default=False, example=True)

from typing import Any, List, Optional
from pydantic import field_validator, model_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


class ProductoCreate(SQLModel):
    nombre: str = Field(..., min_length=1, max_length=150)
    descripcion: str = Field(default="")
    precio_base: float = Field(..., ge=0)
    imagen_url: str = Field(default="")
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    categoria_id: int = Field(..., gt=0)

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v: str) -> str:
        limpio = v.strip()
        if not limpio:
            raise ValueError("El nombre no puede estar vacío")
        return limpio


class ProductoUpdate(SQLModel):
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=150)
    descripcion: Optional[str] = Field(default=None)
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagen_url: Optional[str] = Field(default=None)
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = Field(default=None)
    categoria_id: Optional[int] = Field(default=None, gt=0)

    @model_validator(mode="before")
    @classmethod
    def rechazar_nulos_explicitos(cls, data: Any) -> Any:
        if isinstance(data, dict):
            campos = (
                "nombre",
                "descripcion",
                "precio_base",
                "imagen_url",
                "stock",
                "disponible",
                "categoria_id",
            )
            for campo in campos:
                if campo in data and data[campo] is None:
                    raise ValueError(f"El campo '{campo}' no puede ser nulo")
        return data

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        limpio = v.strip()
        if not limpio:
            raise ValueError("El nombre no puede estar vacío")
        return limpio


class ProductoStockUpdate(SQLModel):
    stock: int = Field(..., ge=0)
    disponible: bool


class ProductoRead(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: str
    precio_base: float
    imagen_url: str
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: List[ProductoRead]
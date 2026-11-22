from typing import Any, Optional
from pydantic import field_validator, model_validator
from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    descripcion: str = Field(default="")

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v: str) -> str:
        limpio = v.strip()
        if len(limpio) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")
        return limpio


class CategoriaUpdate(SQLModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None)

    @model_validator(mode="before")
    @classmethod
    def rechazar_nulos_explicitos(cls, data: Any) -> Any:
        if isinstance(data, dict):
            for campo in ("nombre", "descripcion"):
                if campo in data and data[campo] is None:
                    raise ValueError(f"El campo '{campo}' no puede ser nulo")
        return data

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        limpio = v.strip()
        if len(limpio) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")
        return limpio


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    activo: bool
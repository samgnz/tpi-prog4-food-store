from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    """Esquema de entrada para el registro de un nuevo usuario (HU-01, RN-09)."""

    nombre: str = Field(..., min_length=1, max_length=100, example="Juan")
    apellido: str = Field(..., min_length=1, max_length=100, example="Pérez")
    email: EmailStr = Field(..., example="juan.perez@foodstore.com")
    celular: Optional[str] = Field(default=None, max_length=50, example="+5491122334455")
    password: str = Field(
        ...,
        min_length=8,
        description="Contraseña de al menos 8 caracteres (RN-09)",
        example="ClaveSegura123",
    )

    @field_validator("nombre", "apellido")
    @classmethod
    def validar_texto_no_vacio(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("El campo no puede estar vacío")
        return v.strip()

    @field_validator("celular")
    @classmethod
    def normalizar_celular(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        limpio = v.strip()
        return limpio if limpio else None


class UserPublic(BaseModel):
    """Esquema público de usuario sin password_hash y con los nombres de sus roles vigentes."""

    id: int
    nombre: str
    apellido: str
    email: str
    celular: Optional[str] = None
    roles: List[str] = Field(default_factory=list)
    activo: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class RolPublic(BaseModel):
    """Esquema de lectura para el catálogo de roles (RN-06)."""

    id: int
    nombre: str
    descripcion: str = ""

    model_config = {"from_attributes": True}

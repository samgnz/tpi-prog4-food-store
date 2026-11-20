from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


class Rol(SQLModel, table=True):
    """Tabla de catálogo de roles del dominio Identidad & Acceso."""

    __tablename__ = "roles"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True, max_length=50)
    descripcion: str = Field(default="")


class UsuarioRol(SQLModel, table=True):
    """Tabla de enlace muchos a muchos entre Usuario y Rol.
    No posee deleted_at: quitar un rol elimina físicamente la fila de enlace (RN-11).
    """

    __tablename__ = "usuario_rol"

    usuario_id: int = Field(foreign_key="usuarios.id", primary_key=True)
    rol_id: int = Field(foreign_key="roles.id", primary_key=True)
    asignado_por_id: Optional[int] = Field(
        default=None, foreign_key="usuarios.id", nullable=True
    )
    expires_at: Optional[datetime] = Field(default=None, nullable=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class Usuario(SQLModel, table=True):
    """Entidad Usuario del dominio Identidad & Acceso con auditoría completa y borrado lógico."""

    __tablename__ = "usuarios"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(min_length=1, max_length=100)
    apellido: str = Field(min_length=1, max_length=100)
    email: str = Field(unique=True, index=True, max_length=255)
    celular: Optional[str] = Field(default=None, nullable=True, max_length=50)
    password_hash: str
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    deleted_at: Optional[datetime] = Field(default=None, nullable=True)

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

from app.producto.model import ProductoCategoria

if TYPE_CHECKING:
    from app.producto.model import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, unique=True)
    descripcion: str = Field(default="")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    deleted_at: Optional[datetime] = Field(default=None, nullable=True)

    productos: List["Producto"] = Relationship(
        back_populates="categorias", link_model=ProductoCategoria
    )

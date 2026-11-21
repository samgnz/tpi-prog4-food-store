from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(
        unique=True, index=True, min_length=2, max_length=100
    )
    descripcion: str = Field(default="")
    activo: bool = Field(default=True)

    productos: List["Producto"] = Relationship(back_populates="categoria")
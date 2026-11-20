from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.categoria.model import Categoria


class ProductoCategoria(SQLModel, table=True):
    """Tabla de enlace muchos a muchos entre Producto y Categoria.
    No tiene deleted_at: desasociar una categoría elimina físicamente la fila de enlace (RN-11).
    """

    __tablename__ = "producto_categoria"

    producto_id: int = Field(
        sa_column=Column(
            Integer,
            ForeignKey("productos.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        )
    )
    categoria_id: int = Field(
        sa_column=Column(
            Integer,
            ForeignKey("categorias.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        )
    )
    es_principal: bool = Field(default=False)


# Alias por compatibilidad
ProductoCategoriaLink = ProductoCategoria


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    descripcion: str = Field(default="")
    precio_base: float = Field(ge=0)
    imagenes_url: list[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String))
    )
    disponible: bool = Field(default=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    deleted_at: Optional[datetime] = Field(default=None, nullable=True)

    categorias: List["Categoria"] = Relationship(
        back_populates="productos", link_model=ProductoCategoria
    )

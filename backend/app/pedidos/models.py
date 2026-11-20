from datetime import datetime, timezone
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel


class EstadoPedido(SQLModel, table=True):
    """Tabla de catálogo EstadoPedido (solo lectura vía GET, cargada con seed.py — RN-06)."""

    __tablename__ = "estados_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True, max_length=50)
    descripcion: str = Field(default="")


class FormaPago(SQLModel, table=True):
    """Tabla de catálogo FormaPago (solo lectura vía GET, cargada con seed.py — RN-06)."""

    __tablename__ = "formas_pago"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True, max_length=50)
    descripcion: str = Field(default="")


class DireccionEntrega(SQLModel, table=True):
    """Entidad DireccionEntrega con auditoría completa y borrado lógico (RN-05, RN-11)."""

    __tablename__ = "direcciones_entrega"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", index=True)
    calle: str = Field(min_length=1, max_length=150)
    numero: str = Field(min_length=1, max_length=30)
    ciudad: str = Field(default="Córdoba", max_length=100)
    referencias: Optional[str] = Field(default=None, nullable=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    deleted_at: Optional[datetime] = Field(default=None, nullable=True)


class DetallePedido(SQLModel, table=True):
    """DetallePedido (inmutable: no se modifica ni se borra — Consigna e)."""

    __tablename__ = "detalles_pedido"

    pedido_id: int = Field(foreign_key="pedidos.id", primary_key=True)
    producto_id: int = Field(foreign_key="productos.id", primary_key=True)
    cantidad: int = Field(ge=1)
    precio_unitario: float = Field(ge=0)

    pedido: Optional["Pedido"] = Relationship(back_populates="detalles")


class HistorialEstadoPedido(SQLModel, table=True):
    """HistorialEstadoPedido (solo inserciones: no se modifica ni se borra — Consigna e)."""

    __tablename__ = "historial_estados_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", index=True)
    estado: str = Field(max_length=50)
    cambiado_por_id: Optional[int] = Field(
        default=None, foreign_key="usuarios.id", nullable=True
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class Pedido(SQLModel, table=True):
    """Entidad Pedido con auditoría completa y borrado lógico (RN-05, RN-11)."""

    __tablename__ = "pedidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: Optional[int] = Field(
        default=None, foreign_key="usuarios.id", nullable=True, index=True
    )
    fecha: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    estado: str = Field(default="PENDIENTE", index=True)
    total: float = Field(default=0.0, ge=0)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    deleted_at: Optional[datetime] = Field(default=None, nullable=True)

    detalles: List[DetallePedido] = Relationship(back_populates="pedido")

from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, field_validator

EstadoPedidoType = Literal[
    "PENDIENTE",
    "CONFIRMADO",
    "EN_PREPARACION",
    "EN_CAMINO",
    "ENTREGADO",
    "CANCELADO",
]


class CatalogoRead(BaseModel):
    id: int
    nombre: str
    descripcion: str = ""

    model_config = {"from_attributes": True}


class DireccionEntregaCreate(BaseModel):
    calle: str = Field(..., min_length=1, max_length=150)
    numero: str = Field(..., min_length=1, max_length=30)
    ciudad: str = Field(default="Córdoba", min_length=1, max_length=100)
    referencias: Optional[str] = None


class DireccionEntregaRead(BaseModel):
    id: int
    usuario_id: int
    calle: str
    numero: str
    ciudad: str
    referencias: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class DetallePedidoCreate(BaseModel):
    producto_id: int = Field(..., gt=0, description="ID del producto")
    cantidad: int = Field(
        ..., ge=1, description="Cantidad solicitada (mayor o igual a 1)"
    )


class DetallePedidoRead(BaseModel):
    pedido_id: int
    producto_id: int
    cantidad: int
    precio_unitario: float

    model_config = {"from_attributes": True}


class PedidoCreate(BaseModel):
    detalles: List[DetallePedidoCreate] = Field(
        ...,
        min_length=1,
        description="Lista de detalles del pedido (al menos uno)",
    )

    @field_validator("detalles")
    @classmethod
    def validar_productos_no_repetidos(
        cls, detalles: List[DetallePedidoCreate]
    ) -> List[DetallePedidoCreate]:
        productos_vistos = set()
        for item in detalles:
            if item.producto_id in productos_vistos:
                raise ValueError(
                    f"El producto con id {item.producto_id} está repetido en los detalles del pedido"
                )
            productos_vistos.add(item.producto_id)
        return detalles


class PedidoUpdate(BaseModel):
    estado: EstadoPedidoType


class PedidoRead(BaseModel):
    id: int
    usuario_id: Optional[int] = None
    fecha: datetime
    estado: str
    total: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    detalles: List[DetallePedidoRead] = []

    model_config = {"from_attributes": True}

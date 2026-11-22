from datetime import datetime
from typing import List, Literal, Optional
from pydantic import field_validator
from sqlmodel import Field, SQLModel

FormaPagoType = Literal["EFECTIVO", "TRANSFERENCIA"]
EstadoPedidoType = Literal[
    "PENDIENTE",
    "EN_PREPARACION",
    "ENTREGADO",
    "CANCELADO",
]


class ItemPedidoCreate(SQLModel):
    producto_id: int = Field(..., gt=0)
    cantidad: int = Field(..., ge=1)


class PedidoCreate(SQLModel):
    items: List[ItemPedidoCreate] = Field(..., min_length=1)
    forma_pago: FormaPagoType
    direccion_entrega: str = Field(..., min_length=5, max_length=200)
    notas: Optional[str] = Field(default="")

    @field_validator("direccion_entrega")
    @classmethod
    def validar_direccion(cls, v: str) -> str:
        limpio = v.strip()
        if len(limpio) < 5:
            raise ValueError(
                "La dirección de entrega debe tener al menos 5 caracteres"
            )
        return limpio


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: Optional[str] = ""
    total: float
    created_at: datetime
    updated_at: datetime
    items: List[DetallePedidoRead] = []


class PedidosPaginados(SQLModel):
    total: int
    items: List[PedidoRead]


class CambioEstado(SQLModel):
    estado: EstadoPedidoType


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
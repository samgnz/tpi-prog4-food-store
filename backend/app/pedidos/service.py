from datetime import datetime, timezone
from typing import List, Optional
from app.pedidos.models import DetallePedido, HistorialEstadoPedido, Pedido
from app.pedidos.schemas import PedidoCreate, PedidoRead, PedidoUpdate
from app.pedidos.unit_of_work import PedidoUnitOfWork


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int):
        self.pedido_id = pedido_id
        super().__init__(f"Pedido con id {pedido_id} no encontrado")


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int):
        self.producto_id = producto_id
        super().__init__(f"Producto con id {producto_id} no encontrado")


class EstadoPedidoInvalidoError(Exception):
    def __init__(self, estado_actual: str):
        self.estado_actual = estado_actual
        super().__init__(
            f"No se puede modificar el estado de un pedido que ya se encuentra {estado_actual}"
        )


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def listar(self, skip: int = 0, limit: int = 100) -> List[PedidoRead]:
        with self.uow as uow:
            pedidos = uow.pedidos.get_all_active(skip=skip, limit=limit)
            return [PedidoRead.model_validate(p) for p in pedidos]

    def obtener_por_id(self, pedido_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_active_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            return PedidoRead.model_validate(pedido)

    def crear(
        self, data: PedidoCreate, usuario_id: Optional[int] = None
    ) -> PedidoRead:
        """Crea un pedido tomando el usuario_id de la sesión autenticada (RN-05)."""
        with self.uow as uow:
            pedido = uow.pedidos.create(
                Pedido(usuario_id=usuario_id, estado="PENDIENTE", total=0.0)
            )
            assert pedido.id is not None
            total = 0.0
            for item in data.detalles:
                producto = uow.productos.get_active_by_id(item.producto_id)
                if producto is None:
                    raise ProductoNoEncontrado(item.producto_id)
                assert producto.id is not None
                uow.detalles.create(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        precio_unitario=producto.precio_base,
                    )
                )
                total += item.cantidad * producto.precio_base

            assert uow.session is not None
            uow.session.add(
                HistorialEstadoPedido(
                    pedido_id=pedido.id,
                    estado="PENDIENTE",
                    cambiado_por_id=usuario_id,
                )
            )
            pedido.total = total
            uow.pedidos.update(pedido)
            return PedidoRead.model_validate(pedido)

    def actualizar_estado(
        self,
        pedido_id: int,
        data: PedidoUpdate,
        cambiado_por_id: Optional[int] = None,
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_active_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            if pedido.estado in ("ENTREGADO", "CANCELADO"):
                raise EstadoPedidoInvalidoError(pedido.estado)
            pedido.estado = data.estado
            pedido.updated_at = datetime.now(timezone.utc)
            assert uow.session is not None
            uow.session.add(
                HistorialEstadoPedido(
                    pedido_id=pedido_id,
                    estado=data.estado,
                    cambiado_por_id=cambiado_por_id,
                )
            )
            uow.pedidos.update(pedido)
            return PedidoRead.model_validate(pedido)

    def eliminar(self, pedido_id: int) -> None:
        with self.uow as uow:
            pedido = uow.pedidos.get_active_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            uow.pedidos.soft_delete(pedido)

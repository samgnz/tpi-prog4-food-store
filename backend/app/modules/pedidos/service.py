from datetime import datetime, timezone
from typing import Dict, Optional, Set

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int):
        super().__init__(f"Pedido con id {pedido_id} no encontrado")


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int):
        super().__init__(f"Producto con id {producto_id} no encontrado")


class PedidoAjeno(Exception):
    def __init__(self):
        super().__init__("No tiene permisos para acceder a este pedido")


class ProductoRepetido(Exception):
    def __init__(self, producto_id: int):
        super().__init__(
            f"El producto con id {producto_id} está repetido en el pedido"
        )


class ProductoNoDisponible(Exception):
    def __init__(self, nombre: str):
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(Exception):
    def __init__(self, nombre: str, disponible: int, solicitado: int):
        super().__init__(
            f"Stock insuficiente para '{nombre}' "
            f"(disponible: {disponible}, solicitado: {solicitado})"
        )


class TransicionInvalida(Exception):
    def __init__(self, estado_actual: str, estado_nuevo: str):
        super().__init__(
            f"No se puede pasar un pedido de '{estado_actual}' a '{estado_nuevo}'"
        )


TRANSICIONES_VALIDAS: Dict[str, Set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def _restituir_stock(
        self, uow: PedidoUnitOfWork, pedido: Pedido
    ) -> None:
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.productos.update(producto)

    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            vistos: Set[int] = set()
            for item in data.items:
                if item.producto_id in vistos:
                    raise ProductoRepetido(item.producto_id)
                vistos.add(item.producto_id)

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado="PENDIENTE",
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas or "",
                    total=0.0,
                )
            )
            assert pedido.id is not None

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_active_by_id(item.producto_id)
                if producto is None:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        producto.nombre, producto.stock, item.cantidad
                    )

                producto.stock -= item.cantidad
                uow.productos.update(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                assert producto.id is not None
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.update(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self,
        current_user: Usuario,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> PedidosPaginados:
        usuario_filtro = (
            None if current_user.role == "admin" else current_user.id
        )
        with self.uow as uow:
            pedidos, total = uow.pedidos.list_by_usuario(
                skip=skip,
                limit=limit,
                usuario_id=usuario_filtro,
                estado=estado,
            )
            items = [PedidoRead.model_validate(p) for p in pedidos]
            return PedidosPaginados(total=total, items=items)

    def obtener_por_id(
        self, pedido_id: int, current_user: Usuario
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            if (
                current_user.role != "admin"
                and pedido.usuario_id != current_user.id
            ):
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(
        self, pedido_id: int, data: CambioEstado
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)

            permitidos = TRANSICIONES_VALIDAS.get(pedido.estado, set())
            if data.estado not in permitidos:
                raise TransicionInvalida(pedido.estado, data.estado)

            if data.estado == "CANCELADO":
                self._restituir_stock(uow, pedido)

            pedido.estado = data.estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.update(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar_por_dueno(
        self, pedido_id: int, current_user: Usuario
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            if pedido.usuario_id != current_user.id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(pedido.estado, "CANCELADO")

            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.update(pedido)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_pedidos_hoy(),
                ingresos_entregados=uow.pedidos.sum_ingresos_entregados(),
            )
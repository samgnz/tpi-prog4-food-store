from app.core.unit_of_work import BaseUnitOfWork
from app.modules.pedidos.repository import (
    DetallePedidoRepository,
    PedidoRepository,
)
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(BaseUnitOfWork):
    """Unit of Work del módulo pedidos: expone los repositorios de pedidos,
    detalles y productos compartiendo la misma sesión transaccional.
    """

    pedidos: PedidoRepository
    detalles: DetallePedidoRepository
    productos: ProductoRepository

    def __enter__(self):
        super().__enter__()
        assert self.session is not None
        self.pedidos = PedidoRepository(self.session)
        self.detalles = DetallePedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self
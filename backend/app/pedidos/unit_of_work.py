from app.core.unit_of_work import BaseUnitOfWork
from app.pedidos.repository import (
    PedidoRepository,
    DetallePedidoRepository,
    ProductoRepository,
)


class PedidoUnitOfWork(BaseUnitOfWork):
    """Unit of Work del módulo pedidos: abre la sesión y expone los repositorios
    de pedidos, detalles y productos dentro de una misma transacción.
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

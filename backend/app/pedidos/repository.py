from datetime import datetime, timezone
from typing import List, Optional
from sqlmodel import Session, select

from app.core.repository import BaseRepository
from app.pedidos.models import DetallePedido, Pedido
from app.producto.model import Producto


class PedidoRepository(BaseRepository[Pedido]):
    """Repositorio de Pedido que filtra aquellos con borrado lógico (deleted_at != None)."""

    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def get_all_active(self, skip: int = 0, limit: int = 100) -> List[Pedido]:
        statement = (
            select(Pedido)
            .where(Pedido.deleted_at == None)  # noqa: E711
            .order_by(Pedido.id)  # type: ignore[arg-type]
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(statement).all())

    def get_active_by_id(self, pedido_id: int) -> Optional[Pedido]:
        statement = select(Pedido).where(
            Pedido.id == pedido_id,
            Pedido.deleted_at == None,  # noqa: E711
        )
        return self.session.exec(statement).first()

    def soft_delete(self, pedido: Pedido) -> Pedido:
        now = datetime.now(timezone.utc)
        pedido.deleted_at = now
        pedido.updated_at = now
        self.session.add(pedido)
        self.session.flush()
        return pedido


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session):
        super().__init__(session, DetallePedido)

    def get_by_pedido_id(self, pedido_id: int) -> List[DetallePedido]:
        statement = select(DetallePedido).where(
            DetallePedido.pedido_id == pedido_id
        )
        return list(self.session.exec(statement).all())


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_active_by_id(self, producto_id: int) -> Optional[Producto]:
        statement = select(Producto).where(
            Producto.id == producto_id,
            Producto.deleted_at == None,  # noqa: E711
        )
        return self.session.exec(statement).first()

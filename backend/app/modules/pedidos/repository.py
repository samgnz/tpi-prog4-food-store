from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy import func
from sqlmodel import Session, select

from app.core.repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def list_by_usuario(
        self,
        skip: int = 0,
        limit: int = 20,
        usuario_id: Optional[int] = None,
        estado: Optional[str] = None,
    ) -> Tuple[List[Pedido], int]:
        base_query = select(Pedido)
        count_query = select(func.count()).select_from(Pedido)

        if usuario_id is not None:
            base_query = base_query.where(Pedido.usuario_id == usuario_id)
            count_query = count_query.where(
                Pedido.usuario_id == usuario_id
            )

        if estado and estado.strip():
            est = estado.strip().upper()
            base_query = base_query.where(Pedido.estado == est)
            count_query = count_query.where(Pedido.estado == est)

        total = int(self.session.exec(count_query).one())
        items = list(
            self.session.exec(
                base_query.order_by(Pedido.id.desc())  # type: ignore[union-attr]
                .offset(skip)
                .limit(limit)
            ).all()
        )
        return items, total

    def count_by_estado(self, estado: str) -> int:
        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.estado == estado)
        )
        return int(self.session.exec(statement).one())

    def count_pedidos_hoy(self) -> int:
        now = datetime.now(timezone.utc)
        start_of_day = datetime(
            now.year, now.month, now.day, tzinfo=timezone.utc
        )
        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.created_at >= start_of_day)
        )
        return int(self.session.exec(statement).one())

    def sum_ingresos_entregados(self) -> float:
        statement = select(
            func.coalesce(func.sum(Pedido.total), 0.0)
        ).where(Pedido.estado == "ENTREGADO")
        return float(self.session.exec(statement).one())


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session):
        super().__init__(session, DetallePedido)
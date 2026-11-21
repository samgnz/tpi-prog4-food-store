from typing import List, Optional
from sqlalchemy import func
from sqlmodel import Session, select

from app.core.repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_all_active(self) -> List[Categoria]:
        statement = (
            select(Categoria)
            .where(Categoria.activo == True)  # noqa: E712
            .order_by(Categoria.id)  # type: ignore[arg-type]
        )
        return list(self.session.exec(statement).all())

    def get_active_by_id(self, categoria_id: int) -> Optional[Categoria]:
        statement = select(Categoria).where(
            Categoria.id == categoria_id,
            Categoria.activo == True,  # noqa: E712
        )
        return self.session.exec(statement).first()

    def get_by_nombre(
        self, nombre: str, exclude_id: Optional[int] = None
    ) -> Optional[Categoria]:
        """Busca por nombre sin distinguir mayúsculas, incluyendo inactivas
        (la baja lógica no libera el nombre único).
        """
        statement = select(Categoria).where(
            func.lower(Categoria.nombre) == nombre.strip().lower()
        )
        if exclude_id is not None:
            statement = statement.where(Categoria.id != exclude_id)
        return self.session.exec(statement).first()
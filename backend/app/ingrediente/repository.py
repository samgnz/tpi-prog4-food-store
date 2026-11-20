from typing import Optional
from sqlalchemy import func
from sqlmodel import Session, select
from app.core.repository import BaseRepository
from app.ingrediente.model import Ingrediente


class IngredienteRepository(BaseRepository[Ingrediente]):
    def __init__(self, session: Session):
        super().__init__(session, Ingrediente)

    def get_by_nombre_case_insensitive(
        self, nombre: str, exclude_id: Optional[int] = None
    ) -> Optional[Ingrediente]:
        statement = select(Ingrediente).where(
            func.lower(Ingrediente.nombre) == nombre.strip().lower()
        )
        if exclude_id is not None:
            statement = statement.where(Ingrediente.id != exclude_id)
        return self.session.exec(statement).first()

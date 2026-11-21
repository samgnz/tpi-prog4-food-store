from typing import List, Optional
from sqlalchemy import func
from sqlmodel import Session, select

from app.core.repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session):
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Optional[Usuario]:
        statement = select(Usuario).where(
            func.lower(Usuario.username) == username.strip().lower()
        )
        return self.session.exec(statement).first()

    def get_by_email(self, email: str) -> Optional[Usuario]:
        statement = select(Usuario).where(
            func.lower(Usuario.email) == email.strip().lower()
        )
        return self.session.exec(statement).first()

    def get_all_users(
        self, skip: int = 0, limit: int = 100
    ) -> List[Usuario]:
        statement = (
            select(Usuario)
            .order_by(Usuario.id)  # type: ignore[arg-type]
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(statement).all())
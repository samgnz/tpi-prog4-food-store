from typing import Generic, TypeVar, Type, List, Optional, Any
from sqlmodel import SQLModel, Session, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Repositorio genérico base para encapsular el acceso a datos de una entidad.
    No confirma la transacción (no llama a commit), delegando esa responsabilidad al Unit of Work.
    """

    def __init__(self, session: Session, model: Type[T]):
        self.session = session
        self.model = model

    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        statement = select(self.model).offset(skip).limit(limit)
        return list(self.session.exec(statement).all())

    def get_by_id(self, entity_id: Any) -> Optional[T]:
        return self.session.get(self.model, entity_id)

    def add(self, obj: T) -> T:
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def create(self, obj: T) -> T:
        return self.add(obj)

    def update(self, obj: T) -> T:
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def delete(self, obj: T) -> None:
        self.session.delete(obj)
        self.session.flush()

from typing import Callable, Optional
from sqlmodel import Session
from app.core.database import engine


class BaseUnitOfWork:
    def __init__(self, session_factory: Callable[[], Session] = lambda: Session(engine)):
        self.session_factory = session_factory
        self.session: Optional[Session] = None

    def __enter__(self):
        self.session = self.session_factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.session is None:
            return
        try:
            if exc_type is None:
                self.commit()
            else:
                self.rollback()
        finally:
            self.session.close()

    def commit(self) -> None:
        if self.session is not None:
            self.session.commit()

    def rollback(self) -> None:
        if self.session is not None:
            self.session.rollback()

from app.core.unit_of_work import BaseUnitOfWork
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUnitOfWork(BaseUnitOfWork):
    categorias: CategoriaRepository

    def __enter__(self):
        super().__enter__()
        assert self.session is not None
        self.categorias = CategoriaRepository(self.session)
        return self
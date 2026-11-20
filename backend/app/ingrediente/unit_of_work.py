from app.core.unit_of_work import BaseUnitOfWork
from app.ingrediente.repository import IngredienteRepository


class IngredienteUnitOfWork(BaseUnitOfWork):
    ingredientes: IngredienteRepository

    def __enter__(self):
        super().__enter__()
        assert self.session is not None
        self.ingredientes = IngredienteRepository(self.session)
        return self

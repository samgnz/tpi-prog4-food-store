from app.core.unit_of_work import BaseUnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(BaseUnitOfWork):
    productos: ProductoRepository
    categorias: CategoriaRepository

    def __enter__(self):
        super().__enter__()
        assert self.session is not None
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        return self
from typing import Optional

from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int):
        super().__init__(f"Producto con id {producto_id} no encontrado")


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            productos, total = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            items = [ProductoRead.model_validate(p) for p in productos]
            return ProductosPaginados(total=total, items=items)

    def obtener_por_id(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(producto_id)
            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(data.categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada(data.categoria_id)

            nuevo = Producto(
                **data.model_dump(),
                activo=True,
            )
            uow.productos.add(nuevo)
            return ProductoRead.model_validate(nuevo)

    def actualizar(
        self, producto_id: int, data: ProductoUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(producto_id)

            if data.categoria_id is not None:
                categoria = uow.categorias.get_active_by_id(data.categoria_id)
                if categoria is None:
                    raise CategoriaNoEncontrada(data.categoria_id)

            cambios = data.model_dump(exclude_unset=True, exclude_none=True)
            producto.sqlmodel_update(cambios)
            uow.productos.update(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self, producto_id: int, data: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(producto_id)

            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.productos.update(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(producto_id)
            producto.activo = False
            uow.productos.update(producto)
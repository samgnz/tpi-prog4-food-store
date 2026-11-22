from typing import List

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int):
        super().__init__(f"Categoría con id {categoria_id} no encontrada")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str):
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def listar(self) -> List[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.get_all_active()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def obtener_por_id(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada(categoria_id)
            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado(data.nombre)
            nueva = Categoria(
                nombre=data.nombre,
                descripcion=data.descripcion,
                activo=True,
            )
            uow.categorias.add(nueva)
            return CategoriaRead.model_validate(nueva)

    def actualizar(
        self, categoria_id: int, data: CategoriaUpdate
    ) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada(categoria_id)

            if data.nombre is not None:
                existente = uow.categorias.get_by_nombre(
                    data.nombre, exclude_id=categoria_id
                )
                if existente is not None:
                    raise NombreDuplicado(data.nombre)

            cambios = data.model_dump(exclude_unset=True, exclude_none=True)
            categoria.sqlmodel_update(cambios)
            uow.categorias.update(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada(categoria_id)
            categoria.activo = False
            uow.categorias.update(categoria)
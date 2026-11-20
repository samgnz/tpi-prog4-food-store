from typing import List
from app.ingrediente.model import Ingrediente
from app.ingrediente.schema import IngredienteCreate, IngredienteRead, IngredienteUpdate
from app.ingrediente.unit_of_work import IngredienteUnitOfWork


class IngredienteNoEncontradoError(Exception):
    def __init__(self, ingrediente_id: int):
        self.ingrediente_id = ingrediente_id
        super().__init__(f"Ingrediente con id {ingrediente_id} no encontrado")


class IngredienteDuplicadoError(Exception):
    def __init__(self, nombre: str):
        self.nombre = nombre
        super().__init__(f"Ya existe un ingrediente con el nombre '{nombre}'")


class IngredienteService:
    def __init__(self, uow: IngredienteUnitOfWork):
        self.uow = uow

    def listar(self, skip: int = 0, limit: int = 100) -> List[IngredienteRead]:
        with self.uow as uow:
            items = uow.ingredientes.get_all(skip=skip, limit=limit)
            return [IngredienteRead.model_validate(item) for item in items]

    def obtener_por_id(self, ingrediente_id: int) -> IngredienteRead:
        with self.uow as uow:
            ingrediente = uow.ingredientes.get_by_id(ingrediente_id)
            if ingrediente is None:
                raise IngredienteNoEncontradoError(ingrediente_id)
            return IngredienteRead.model_validate(ingrediente)

    def crear(self, data: IngredienteCreate) -> IngredienteRead:
        with self.uow as uow:
            existente = uow.ingredientes.get_by_nombre_case_insensitive(data.nombre)
            if existente is not None:
                raise IngredienteDuplicadoError(data.nombre)
            nuevo = uow.ingredientes.create(Ingrediente(nombre=data.nombre))
            return IngredienteRead.model_validate(nuevo)

    def actualizar(
        self, ingrediente_id: int, data: IngredienteUpdate
    ) -> IngredienteRead:
        with self.uow as uow:
            ingrediente = uow.ingredientes.get_by_id(ingrediente_id)
            if ingrediente is None:
                raise IngredienteNoEncontradoError(ingrediente_id)
            existente = uow.ingredientes.get_by_nombre_case_insensitive(
                data.nombre, exclude_id=ingrediente_id
            )
            if existente is not None:
                raise IngredienteDuplicadoError(data.nombre)
            ingrediente.nombre = data.nombre
            actualizado = uow.ingredientes.update(ingrediente)
            return IngredienteRead.model_validate(actualizado)

    def eliminar(self, ingrediente_id: int) -> None:
        with self.uow as uow:
            ingrediente = uow.ingredientes.get_by_id(ingrediente_id)
            if ingrediente is None:
                raise IngredienteNoEncontradoError(ingrediente_id)
            uow.ingredientes.delete(ingrediente)

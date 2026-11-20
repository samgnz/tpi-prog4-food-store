from typing import Annotated
from pydantic import BaseModel, StringConstraints

NombreNoVacio = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1),
]


class IngredienteBase(BaseModel):
    nombre: NombreNoVacio


class IngredienteCreate(IngredienteBase):
    pass


class IngredienteUpdate(IngredienteBase):
    pass


class IngredienteRead(IngredienteBase):
    id: int

    model_config = {"from_attributes": True}

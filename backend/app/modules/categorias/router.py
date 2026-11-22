from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get(
    "",
    response_model=List[CategoriaRead],
    status_code=status.HTTP_200_OK,
)
def listar_categorias(
    service: CategoriaService = Depends(get_categoria_service),
) -> List[CategoriaRead]:
    return service.listar()


@router.get(
    "/{id}",
    response_model=CategoriaRead,
    status_code=status.HTTP_200_OK,
)
def detalle_categoria(
    id: int = Path(..., gt=0),
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return service.obtener_por_id(id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_categoria(
    data: CategoriaCreate,
    service: CategoriaService = Depends(get_categoria_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc


@router.put(
    "/{id}",
    response_model=CategoriaRead,
    status_code=status.HTTP_200_OK,
)
def actualizar_categoria(
    data: CategoriaUpdate,
    id: int = Path(..., gt=0),
    service: CategoriaService = Depends(get_categoria_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> CategoriaRead:
    try:
        return service.actualizar(id, data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except NombreDuplicado as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_categoria(
    id: int = Path(..., gt=0),
    service: CategoriaService = Depends(get_categoria_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> None:
    try:
        service.eliminar(id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
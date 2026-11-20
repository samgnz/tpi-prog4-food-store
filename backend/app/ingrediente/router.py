from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.ingrediente.schema import (
    IngredienteCreate,
    IngredienteRead,
    IngredienteUpdate,
)
from app.ingrediente.service import (
    IngredienteDuplicadoError,
    IngredienteNoEncontradoError,
    IngredienteService,
)
from app.ingrediente.unit_of_work import IngredienteUnitOfWork

router = APIRouter(prefix="/ingredientes", tags=["Ingredientes"])


def get_service() -> IngredienteService:
    return IngredienteService(IngredienteUnitOfWork())


@router.get(
    "",
    response_model=List[IngredienteRead],
    status_code=status.HTTP_200_OK,
)
@router.get(
    "/",
    response_model=List[IngredienteRead],
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def listar_ingredientes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=200),
    service: IngredienteService = Depends(get_service),
):
    return service.listar(skip=skip, limit=limit)


@router.get(
    "/{id}",
    response_model=IngredienteRead,
    status_code=status.HTTP_200_OK,
)
def detalle_ingrediente(
    id: int = Path(..., gt=0),
    service: IngredienteService = Depends(get_service),
):
    try:
        return service.obtener_por_id(id)
    except IngredienteNoEncontradoError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.post(
    "",
    response_model=IngredienteRead,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "/",
    response_model=IngredienteRead,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def crear_ingrediente(
    data: IngredienteCreate,
    service: IngredienteService = Depends(get_service),
):
    try:
        return service.crear(data)
    except IngredienteDuplicadoError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc


@router.put(
    "/{id}",
    response_model=IngredienteRead,
    status_code=status.HTTP_200_OK,
)
def actualizar_ingrediente(
    data: IngredienteUpdate,
    id: int = Path(..., gt=0),
    service: IngredienteService = Depends(get_service),
):
    try:
        return service.actualizar(id, data)
    except IngredienteNoEncontradoError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except IngredienteDuplicadoError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_ingrediente(
    id: int = Path(..., gt=0),
    service: IngredienteService = Depends(get_service),
):
    try:
        service.eliminar(id)
    except IngredienteNoEncontradoError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc

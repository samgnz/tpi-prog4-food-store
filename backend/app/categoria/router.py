from typing import List
from fastapi import APIRouter, Depends, Path, Query, status
from sqlmodel import Session

from app.categoria import schema as schemas
from app.categoria import service as services
from app.core.database import get_session
from app.modules.usuarios.dependencies import (
    get_current_active_user,
    require_role,
)
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["Categorías"])


@router.post(
    "", response_model=schemas.CategoriaRead, status_code=status.HTTP_201_CREATED
)
@router.post(
    "/",
    response_model=schemas.CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def alta_categoria(
    categoria: schemas.CategoriaCreate,
    session: Session = Depends(get_session),
    _admin: Usuario = Depends(require_role(["admin"])),
):
    return services.crear(session, categoria)


@router.get(
    "",
    response_model=List[schemas.CategoriaRead],
    status_code=status.HTTP_200_OK,
)
@router.get(
    "/",
    response_model=List[schemas.CategoriaRead],
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def listar_categorias(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=200),
    session: Session = Depends(get_session),
    _user: Usuario = Depends(get_current_active_user),
):
    return services.obtener_todas(session, skip, limit)


@router.get(
    "/{id}", response_model=schemas.CategoriaRead, status_code=status.HTTP_200_OK
)
def detalle_categoria(
    id: int = Path(..., gt=0),
    session: Session = Depends(get_session),
    _user: Usuario = Depends(get_current_active_user),
):
    return services.obtener_por_id(session, id)


@router.put(
    "/{id}", response_model=schemas.CategoriaRead, status_code=status.HTTP_200_OK
)
@router.patch(
    "/{id}",
    response_model=schemas.CategoriaRead,
    status_code=status.HTTP_200_OK,
)
def actualizar_categoria(
    categoria: schemas.CategoriaUpdate,
    id: int = Path(..., gt=0),
    session: Session = Depends(get_session),
    _admin: Usuario = Depends(require_role(["admin"])),
):
    return services.actualizar_total(session, id, categoria)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_categoria(
    id: int = Path(..., gt=0),
    session: Session = Depends(get_session),
    _admin: Usuario = Depends(require_role(["admin"])),
):
    return services.eliminar(session, id)

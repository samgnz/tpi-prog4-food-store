from typing import List, Optional
from fastapi import APIRouter, Depends, Path, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.modules.usuarios.dependencies import (
    get_current_active_user,
    require_role,
)
from app.modules.usuarios.models import Usuario
from app.producto import schema as schemas
from app.producto import service as services

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.post(
    "", response_model=schemas.ProductoRead, status_code=status.HTTP_201_CREATED
)
@router.post(
    "/",
    response_model=schemas.ProductoRead,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def alta_producto(
    producto: schemas.ProductoCreate,
    session: Session = Depends(get_session),
    _admin: Usuario = Depends(require_role(["admin"])),
):
    return services.crear(session, producto)


@router.get(
    "",
    response_model=List[schemas.ProductoRead],
    status_code=status.HTTP_200_OK,
)
@router.get(
    "/",
    response_model=List[schemas.ProductoRead],
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=200),
    disponible: Optional[bool] = Query(None),
    session: Session = Depends(get_session),
    _user: Usuario = Depends(get_current_active_user),
):
    return services.obtener_todos(session, skip, limit, disponible)


@router.get(
    "/{id}", response_model=schemas.ProductoRead, status_code=status.HTTP_200_OK
)
def detalle_producto(
    id: int = Path(..., gt=0),
    session: Session = Depends(get_session),
    _user: Usuario = Depends(get_current_active_user),
):
    return services.obtener_por_id(session, id)


@router.put(
    "/{id}", response_model=schemas.ProductoRead, status_code=status.HTTP_200_OK
)
@router.patch(
    "/{id}", response_model=schemas.ProductoRead, status_code=status.HTTP_200_OK
)
def actualizar_producto(
    producto: schemas.ProductoUpdate,
    id: int = Path(..., gt=0),
    session: Session = Depends(get_session),
    _admin: Usuario = Depends(require_role(["admin"])),
):
    return services.actualizar_total(session, id, producto)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_producto(
    id: int = Path(..., gt=0),
    session: Session = Depends(get_session),
    _admin: Usuario = Depends(require_role(["admin"])),
):
    return services.eliminar(session, id)


@router.post(
    "/{id}/categorias",
    response_model=schemas.ProductoRead,
    status_code=status.HTTP_200_OK,
)
def asociar_categoria_a_producto(
    data: schemas.ProductoCategoriaAssign,
    id: int = Path(..., gt=0),
    session: Session = Depends(get_session),
    _admin: Usuario = Depends(require_role(["admin"])),
):
    return services.asociar_categoria(
        session, id, data.categoria_id, data.es_principal
    )


@router.get(
    "/{id}/categorias",
    response_model=List[schemas.CategoriaRead],
    status_code=status.HTTP_200_OK,
)
def listar_categorias_de_producto(
    id: int = Path(..., gt=0),
    session: Session = Depends(get_session),
    _user: Usuario = Depends(get_current_active_user),
):
    return services.listar_categorias_de_producto(session, id)


@router.delete(
    "/{id}/categorias/{categoria_id}",
    response_model=schemas.ProductoRead,
    status_code=status.HTTP_200_OK,
)
def desasociar_categoria_de_producto(
    id: int = Path(..., gt=0),
    categoria_id: int = Path(..., gt=0),
    session: Session = Depends(get_session),
    _admin: Usuario = Depends(require_role(["admin"])),
):
    return services.desasociar_categoria(session, id, categoria_id)

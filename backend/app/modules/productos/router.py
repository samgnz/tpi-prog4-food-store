from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get(
    "",
    response_model=ProductosPaginados,
    status_code=status.HTTP_200_OK,
)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    categoria_id: Optional[int] = Query(None, gt=0),
    disponible: Optional[bool] = Query(None),
    service: ProductoService = Depends(get_producto_service),
) -> ProductosPaginados:
    return service.listar(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get(
    "/{id}",
    response_model=ProductoRead,
    status_code=status.HTTP_200_OK,
)
def detalle_producto(
    id: int = Path(..., gt=0),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.obtener_por_id(id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_producto(
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.put(
    "/{id}",
    response_model=ProductoRead,
    status_code=status.HTTP_200_OK,
)
def actualizar_producto(
    data: ProductoUpdate,
    id: int = Path(..., gt=0),
    service: ProductoService = Depends(get_producto_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> ProductoRead:
    try:
        return service.actualizar(id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.patch(
    "/{id}/stock",
    response_model=ProductoRead,
    status_code=status.HTTP_200_OK,
)
def actualizar_stock_producto(
    data: ProductoStockUpdate,
    id: int = Path(..., gt=0),
    service: ProductoService = Depends(get_producto_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> ProductoRead:
    try:
        return service.actualizar_stock(id, data)
    except ProductoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_producto(
    id: int = Path(..., gt=0),
    service: ProductoService = Depends(get_producto_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> None:
    try:
        service.eliminar(id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedidoType,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_pedido(
    data: PedidoCreate,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
) -> PedidoRead:
    assert current_user.id is not None
    try:
        return service.crear(data, usuario_id=current_user.id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except (
        ProductoRepetido,
        ProductoNoDisponible,
        StockInsuficiente,
    ) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.get(
    "",
    response_model=PedidosPaginados,
    status_code=status.HTTP_200_OK,
)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[EstadoPedidoType] = Query(None),
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
) -> PedidosPaginados:
    return service.listar(
        current_user=current_user,
        skip=skip,
        limit=limit,
        estado=estado,
    )


@router.get(
    "/resumen",
    response_model=ResumenPedidos,
    status_code=status.HTTP_200_OK,
)
def resumen_pedidos(
    service: PedidoService = Depends(get_pedido_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> ResumenPedidos:
    return service.resumen()


@router.get(
    "/{id}",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
)
def detalle_pedido(
    id: int = Path(..., gt=0),
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
) -> PedidoRead:
    try:
        return service.obtener_por_id(id, current_user)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except PedidoAjeno as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)
        ) from exc


@router.patch(
    "/{id}/estado",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
)
def cambiar_estado_pedido(
    data: CambioEstado,
    id: int = Path(..., gt=0),
    service: PedidoService = Depends(get_pedido_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> PedidoRead:
    try:
        return service.cambiar_estado(id, data)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except TransicionInvalida as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.patch(
    "/{id}/cancelar",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
)
def cancelar_pedido(
    id: int = Path(..., gt=0),
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
) -> PedidoRead:
    try:
        return service.cancelar_por_dueno(id, current_user)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except PedidoAjeno as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)
        ) from exc
    except TransicionInvalida as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
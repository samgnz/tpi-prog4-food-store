from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlmodel import Session, select

from app.core.database import get_session
from app.modules.usuarios.dependencies import (
    get_current_active_user,
    require_role,
)
from app.modules.usuarios.models import Usuario
from app.pedidos.models import DireccionEntrega, EstadoPedido, FormaPago
from app.pedidos.schemas import (
    CatalogoRead,
    DireccionEntregaCreate,
    DireccionEntregaRead,
    PedidoCreate,
    PedidoRead,
    PedidoUpdate,
)
from app.pedidos.service import (
    EstadoPedidoInvalidoError,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
)
from app.pedidos.unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])
estados_pedido_router = APIRouter(
    prefix="/estados-pedido", tags=["Catálogos"]
)
formas_pago_router = APIRouter(prefix="/formas-pago", tags=["Catálogos"])
direcciones_router = APIRouter(
    prefix="/direcciones-entrega", tags=["Direcciones de Entrega"]
)


def get_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.get(
    "",
    response_model=List[PedidoRead],
    status_code=status.HTTP_200_OK,
)
@router.get(
    "/",
    response_model=List[PedidoRead],
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=200),
    service: PedidoService = Depends(get_service),
    _user: Usuario = Depends(get_current_active_user),
):
    return service.listar(skip=skip, limit=limit)


@router.get(
    "/{id}",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
)
def obtener_pedido(
    id: int = Path(..., gt=0),
    service: PedidoService = Depends(get_service),
    _user: Usuario = Depends(get_current_active_user),
):
    try:
        return service.obtener_por_id(id)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "/",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def crear_pedido(
    data: PedidoCreate,
    service: PedidoService = Depends(get_service),
    current_user: Usuario = Depends(require_role(["user", "admin"])),
):
    """Permite crear un pedido a cualquier usuario con rol 'user' o 'admin'.
    El usuario_id se toma siempre de la sesión autenticada (Consigna c, RN-05).
    """
    try:
        return service.crear(data, usuario_id=current_user.id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.put(
    "/{id}",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
)
@router.patch(
    "/{id}",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
)
def actualizar_estado_pedido(
    data: PedidoUpdate,
    id: int = Path(..., gt=0),
    service: PedidoService = Depends(get_service),
    admin_user: Usuario = Depends(require_role(["admin"])),
):
    try:
        return service.actualizar_estado(
            id, data, cambiado_por_id=admin_user.id
        )
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except EstadoPedidoInvalidoError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_pedido(
    id: int = Path(..., gt=0),
    service: PedidoService = Depends(get_service),
    _admin: Usuario = Depends(require_role(["admin"])),
):
    try:
        service.eliminar(id)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


# --- Catálogos de solo lectura (RN-06: solo exponen GET; 405 ante escrituras) ---


@estados_pedido_router.get(
    "",
    response_model=List[CatalogoRead],
    status_code=status.HTTP_200_OK,
)
@estados_pedido_router.get(
    "/",
    response_model=List[CatalogoRead],
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def listar_estados_pedido(
    session: Session = Depends(get_session),
    _user: Usuario = Depends(get_current_active_user),
) -> List[CatalogoRead]:
    estados = session.exec(
        select(EstadoPedido).order_by(EstadoPedido.id)  # type: ignore[arg-type]
    ).all()
    return [CatalogoRead.model_validate(e) for e in estados]


@formas_pago_router.get(
    "",
    response_model=List[CatalogoRead],
    status_code=status.HTTP_200_OK,
)
@formas_pago_router.get(
    "/",
    response_model=List[CatalogoRead],
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def listar_formas_pago(
    session: Session = Depends(get_session),
    _user: Usuario = Depends(get_current_active_user),
) -> List[CatalogoRead]:
    formas = session.exec(
        select(FormaPago).order_by(FormaPago.id)  # type: ignore[arg-type]
    ).all()
    return [CatalogoRead.model_validate(f) for f in formas]


# --- Direcciones de Entrega (RN-05, RN-11) ---


@direcciones_router.get(
    "",
    response_model=List[DireccionEntregaRead],
    status_code=status.HTTP_200_OK,
)
def listar_direcciones(
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_active_user),
) -> List[DireccionEntregaRead]:
    query = select(DireccionEntrega).where(
        DireccionEntrega.deleted_at == None,  # noqa: E711
        DireccionEntrega.usuario_id == current_user.id,
    )
    direcciones = session.exec(query).all()
    return [DireccionEntregaRead.model_validate(d) for d in direcciones]


@direcciones_router.post(
    "",
    response_model=DireccionEntregaRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_direccion(
    data: DireccionEntregaCreate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(require_role(["user", "admin"])),
) -> DireccionEntregaRead:
    """Crea una dirección de entrega tomando el usuario_id de la sesión (RN-05)."""
    assert current_user.id is not None
    nueva = DireccionEntrega(
        usuario_id=current_user.id,
        calle=data.calle.strip(),
        numero=data.numero.strip(),
        ciudad=data.ciudad.strip(),
        referencias=data.referencias,
    )
    session.add(nueva)
    session.commit()
    session.refresh(nueva)
    return DireccionEntregaRead.model_validate(nueva)


@direcciones_router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_direccion(
    id: int = Path(..., gt=0),
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(require_role(["user", "admin"])),
) -> None:
    direccion = session.get(DireccionEntrega, id)
    if not direccion or direccion.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dirección de entrega no encontrada",
        )
    now = datetime.now(timezone.utc)
    direccion.deleted_at = now
    direccion.updated_at = now
    session.add(direccion)
    session.commit()

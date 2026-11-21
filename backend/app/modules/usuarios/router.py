from typing import List
from fastapi import APIRouter, Depends, Path, Query, status

from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Administración de Usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get(
    "",
    response_model=List[UserPublic],
    status_code=status.HTTP_200_OK,
)
def listar_usuarios(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    service: UsuarioService = Depends(get_usuario_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> List[UserPublic]:
    return service.listar_todos(skip=skip, limit=limit)


@router.post(
    "/{id}/activar",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
)
def activar_usuario(
    id: int = Path(..., gt=0),
    service: UsuarioService = Depends(get_usuario_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> UserPublic:
    return service.activar(id)


@router.post(
    "/{id}/desactivar",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
)
def desactivar_usuario(
    id: int = Path(..., gt=0),
    service: UsuarioService = Depends(get_usuario_service),
    admin: Usuario = Depends(require_role(["admin"])),
) -> UserPublic:
    assert admin.id is not None
    return service.desactivar(id, current_admin_id=admin.id)
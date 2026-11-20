from datetime import timedelta
from typing import List
from fastapi import APIRouter, Depends, Path, Query, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    COOKIE_NAME,
    create_access_token,
)
from app.modules.usuarios import service as services
from app.modules.usuarios.dependencies import (
    get_current_active_user,
    get_current_user,
    require_role,
)
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import RolPublic, UserCreate, UserPublic

router = APIRouter(prefix="/api/v1/auth", tags=["Autenticación y Usuarios"])
roles_router = APIRouter(prefix="/roles", tags=["Catálogos"])


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: UserCreate,
    session: Session = Depends(get_session),
) -> UserPublic:
    """Registra un nuevo usuario públicamente y le asigna el rol 'user' (HU-01, RN-08)."""
    return services.register_user(session, data)


@router.post(
    "/token",
    status_code=status.HTTP_200_OK,
)
def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    """Autentica al usuario por email (campo username del form OAuth2) y emite el JWT
    en la cookie HttpOnly 'access_token' (HU-02, RN-03).
    """
    usuario = services.authenticate_user(
        session=session,
        email=form_data.username,
        password=form_data.password,
    )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": usuario.email, "user_id": usuario.id},
        expires_delta=access_token_expires,
    )

    response.set_cookie(
        key=COOKIE_NAME,
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return {"message": "Inicio de sesión exitoso", "token_type": "bearer"}


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
)
def logout(response: Response):
    """Borra la cookie HttpOnly 'access_token' en el navegador (HU-03)."""
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        samesite="lax",
    )
    return {"message": "Sesión cerrada correctamente"}


@router.get(
    "/me",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
)
def read_users_me(
    current_user: Usuario = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> UserPublic:
    """Devuelve los datos del usuario autenticado y sus roles vigentes (HU-02, HU-04)."""
    return services.get_user_profile(session, current_user)


@router.get(
    "/admin/usuarios",
    response_model=List[UserPublic],
    status_code=status.HTTP_200_OK,
)
def list_users_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=200),
    session: Session = Depends(get_session),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> List[UserPublic]:
    """Listado de usuarios para administradores (incluye activos y desactivados)."""
    return services.list_all_users(session, skip=skip, limit=limit)


@router.post(
    "/admin/usuarios/{id}/activar",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
)
def activate_user_admin(
    id: int = Path(..., gt=0),
    session: Session = Depends(get_session),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> UserPublic:
    """Activa una cuenta de usuario volviendo deleted_at a nulo (solo admin)."""
    return services.activate_user(session, id)


@router.post(
    "/admin/usuarios/{id}/desactivar",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
)
def deactivate_user_admin(
    id: int = Path(..., gt=0),
    session: Session = Depends(get_session),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> UserPublic:
    """Desactiva una cuenta de usuario completando deleted_at con la fecha actual (solo admin)."""
    return services.deactivate_user(session, id)


@roles_router.get(
    "",
    response_model=List[RolPublic],
    status_code=status.HTTP_200_OK,
)
@roles_router.get(
    "/",
    response_model=List[RolPublic],
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def listar_roles(
    session: Session = Depends(get_session),
    _user: Usuario = Depends(get_current_active_user),
) -> List[RolPublic]:
    """Endpoint de solo lectura para la tabla de catálogo Rol (RN-06)."""
    return services.list_roles(session)

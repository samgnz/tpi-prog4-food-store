from typing import Callable, List
import jwt
from fastapi import Depends, HTTPException, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import decode_access_token, oauth2_scheme
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> Usuario:
    """Valida el JWT extraído de la cookie HttpOnly y obtiene el usuario de la base (RN-10)."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        email: str | None = payload.get("sub")
        if not email:
            raise credentials_exception
    except jwt.PyJWTError as exc:
        raise credentials_exception from exc

    repo = UsuarioRepository(session)
    usuario = repo.get_by_email(email)
    if usuario is None:
        raise credentials_exception

    return usuario


def get_current_active_user(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    """Verifica que la cuenta del usuario autenticado no esté desactivada (deleted_at is None)."""
    if current_user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return current_user


def require_role(allowed_roles: List[str]) -> Callable[..., Usuario]:
    """Dependencia reutilizable de autorización RBAC que verifica los roles vigentes
    del usuario en UsuarioRol (expires_at nulo o futuro — Consigna c, RN-14).
    """
    normalized_allowed = {r.strip().lower() for r in allowed_roles}

    def role_checker(
        current_user: Usuario = Depends(get_current_active_user),
        session: Session = Depends(get_session),
    ) -> Usuario:
        assert current_user.id is not None
        repo = UsuarioRepository(session)
        vigentes = {r.strip().lower() for r in repo.get_active_roles(current_user.id)}
        if not vigentes.intersection(normalized_allowed):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene los permisos necesarios para realizar esta acción",
            )
        return current_user

    return role_checker

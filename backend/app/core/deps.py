from typing import Callable, List
from fastapi import Depends, HTTPException, status
from jose import JWTError
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import decode_access_token, oauth2_scheme
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> Usuario:
    """Lee la cookie HttpOnly, valida firma y expiración del JWT y carga el usuario."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        username: str | None = payload.get("sub")
        if not username:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    repo = UsuarioRepository(session)
    usuario = repo.get_by_username(username)
    if usuario is None:
        raise credentials_exception

    return usuario


def get_current_active_user(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    """Rechaza usuarios con disabled=True respondiendo 400."""
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return current_user


def require_role(allowed_roles: List[str]) -> Callable[..., Usuario]:
    """Verifica que el rol del usuario esté dentro de allowed_roles (403 si no)."""
    normalized_allowed = {r.strip().lower() for r in allowed_roles}

    def role_checker(
        current_user: Usuario = Depends(get_current_active_user),
    ) -> Usuario:
        if current_user.role.strip().lower() not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene los permisos necesarios para realizar esta acción",
            )
        return current_user

    return role_checker
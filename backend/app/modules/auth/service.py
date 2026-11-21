from fastapi import HTTPException, status

from app.core.security import get_password_hash, verify_password
from app.modules.auth.schemas import UserCreate, UserPublic
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def register_user(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El nombre de usuario ya se encuentra registrado",
                )
            if uow.usuarios.get_by_email(data.email) is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El email ya se encuentra registrado",
                )

            nuevo = Usuario(
                username=data.username.strip(),
                full_name=data.full_name.strip(),
                email=data.email.strip().lower(),
                hashed_password=get_password_hash(data.password),
                role="user",
                disabled=False,
            )
            uow.usuarios.add(nuevo)
            return UserPublic.model_validate(nuevo)

    def authenticate_user(self, username: str, password: str) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(
                password, usuario.hashed_password
            ):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales incorrectas",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada",
                )
            return UserPublic.model_validate(usuario)
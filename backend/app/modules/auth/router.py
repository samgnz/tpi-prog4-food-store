from datetime import timedelta
from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.core.security import COOKIE_NAME, create_access_token
from app.modules.auth.schemas import LoginMessage, UserCreate, UserPublic
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: UserCreate,
    service: AuthService = Depends(get_auth_service),
) -> UserPublic:
    return service.register_user(data)


@router.post(
    "/token",
    response_model=LoginMessage,
    status_code=status.HTTP_200_OK,
)
def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
) -> LoginMessage:
    usuario = service.authenticate_user(
        username=form_data.username,
        password=form_data.password,
    )
    expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": usuario.username, "user_id": usuario.id},
        expires_delta=expires,
    )
    response.set_cookie(
        key=COOKIE_NAME,
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return LoginMessage(message="Login exitoso")


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
)
def logout(response: Response):
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
) -> UserPublic:
    return UserPublic.model_validate(current_user)
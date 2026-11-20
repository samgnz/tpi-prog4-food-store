import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.security.utils import get_authorization_scheme_param

load_dotenv()

SECRET_KEY: str = os.getenv(
    "SECRET_KEY", "super_secret_jwt_key_tp_unidad_9_programacion_iv_2026"
)
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
COOKIE_NAME: str = "access_token"


def get_password_hash(password: str) -> str:
    """Genera un hash bcrypt a partir de una contraseña en texto plano (RN-01)."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña en texto plano coincide con su hash bcrypt."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


def create_access_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """Crea y firma un token JWT con fecha de expiración."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodifica y valida un token JWT firmado."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """Extiende OAuth2PasswordBearer para extraer el JWT desde la cookie HttpOnly
    'access_token' (y soporta el encabezado Authorization como respaldo para Swagger UI).
    """

    async def __call__(self, request: Request) -> Optional[str]:
        cookie_token = request.cookies.get(COOKIE_NAME)
        if cookie_token:
            scheme, param = get_authorization_scheme_param(cookie_token)
            if scheme.lower() == "bearer" and param:
                return param
            return cookie_token

        authorization = request.headers.get("Authorization")
        scheme, param = get_authorization_scheme_param(authorization)
        if authorization and scheme.lower() == "bearer" and param:
            return param

        if self.auto_error:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No autenticado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return None


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")

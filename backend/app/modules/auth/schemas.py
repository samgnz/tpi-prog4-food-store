from sqlmodel import SQLModel
from app.modules.usuarios.schemas import UserCreate, UserPublic


class LoginMessage(SQLModel):
    message: str = "Login exitoso"


__all__ = ["UserCreate", "UserPublic", "LoginMessage"]
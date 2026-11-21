from datetime import datetime
from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    username: str = Field(..., min_length=2, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=8)

    @field_validator("username", "full_name")
    @classmethod
    def validar_no_vacio(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("El campo no puede estar vacío")
        return v.strip()


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
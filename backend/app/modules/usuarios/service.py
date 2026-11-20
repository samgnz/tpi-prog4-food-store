from typing import List
from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.security import get_password_hash, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.usuarios.schemas import RolPublic, UserCreate, UserPublic


def build_user_public(repo: UsuarioRepository, usuario: Usuario) -> UserPublic:
    """Construye el esquema UserPublic con los roles vigentes del usuario."""
    assert usuario.id is not None
    roles_vigentes = repo.get_active_roles(usuario.id)
    return UserPublic(
        id=usuario.id,
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        email=usuario.email,
        celular=usuario.celular,
        roles=roles_vigentes,
        activo=usuario.deleted_at is None,
        created_at=usuario.created_at,
        updated_at=usuario.updated_at,
        deleted_at=usuario.deleted_at,
    )


def register_user(session: Session, data: UserCreate) -> UserPublic:
    """Registra un nuevo usuario con hash bcrypt y le asigna el rol 'user' en UsuarioRol."""
    repo = UsuarioRepository(session)
    if repo.get_by_email(data.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya se encuentra registrado",
        )

    nuevo_usuario = Usuario(
        nombre=data.nombre.strip(),
        apellido=data.apellido.strip(),
        email=data.email.strip().lower(),
        celular=data.celular,
        password_hash=get_password_hash(data.password),
    )
    repo.create(nuevo_usuario)
    assert nuevo_usuario.id is not None

    rol_user = repo.get_or_create_role(
        nombre="user",
        descripcion="Rol estándar de cliente/usuario autenticado",
    )
    assert rol_user.id is not None

    repo.assign_role(
        usuario_id=nuevo_usuario.id,
        rol_id=rol_user.id,
        asignado_por_id=None,
        expires_at=None,
    )
    session.commit()
    session.refresh(nuevo_usuario)
    return build_user_public(repo, nuevo_usuario)


def authenticate_user(session: Session, email: str, password: str) -> Usuario:
    """Valida las credenciales del usuario por email y verifica que la cuenta esté activa."""
    repo = UsuarioRepository(session)
    usuario = repo.get_by_email(email)
    if usuario is None or not verify_password(password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas: email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if usuario.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )

    return usuario


def get_user_profile(session: Session, usuario: Usuario) -> UserPublic:
    """Devuelve el perfil público del usuario autenticado con sus roles vigentes."""
    repo = UsuarioRepository(session)
    return build_user_public(repo, usuario)


def list_all_users(
    session: Session, skip: int = 0, limit: int = 100
) -> List[UserPublic]:
    """Lista todos los usuarios (incluyendo desactivados) indicando su estado (Consigna b)."""
    repo = UsuarioRepository(session)
    usuarios = repo.get_all_users(skip=skip, limit=limit)
    return [build_user_public(repo, u) for u in usuarios]


def activate_user(session: Session, user_id: int) -> UserPublic:
    """Reactiva un usuario volviendo deleted_at a nulo (Consigna b, e)."""
    repo = UsuarioRepository(session)
    usuario = repo.get_by_id(user_id)
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con id {user_id} no encontrado",
        )
    repo.activate(usuario)
    session.commit()
    session.refresh(usuario)
    return build_user_public(repo, usuario)


def deactivate_user(session: Session, user_id: int) -> UserPublic:
    """Desactiva un usuario completando deleted_at con la fecha actual (Consigna b, e)."""
    repo = UsuarioRepository(session)
    usuario = repo.get_by_id(user_id)
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con id {user_id} no encontrado",
        )
    repo.deactivate(usuario)
    session.commit()
    session.refresh(usuario)
    return build_user_public(repo, usuario)


def list_roles(session: Session) -> List[RolPublic]:
    """Lista los roles del catálogo Rol (solo lectura - RN-06)."""
    repo = UsuarioRepository(session)
    roles = repo.get_all_roles()
    return [RolPublic.model_validate(r) for r in roles]

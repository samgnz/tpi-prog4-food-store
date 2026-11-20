from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import func
from sqlmodel import Session, select

from app.core.repository import BaseRepository
from app.modules.usuarios.models import Rol, Usuario, UsuarioRol


def _is_role_active(expires_at: Optional[datetime]) -> bool:
    """Verifica si una asignación de rol está vigente (RN-14)."""
    if expires_at is None:
        return True
    now = datetime.now(timezone.utc)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at > now


class UsuarioRepository(BaseRepository[Usuario]):
    """Repositorio para la gestión de Usuario, Rol y UsuarioRol."""

    def __init__(self, session: Session):
        super().__init__(session, Usuario)

    def get_by_email(self, email: str) -> Optional[Usuario]:
        statement = select(Usuario).where(
            func.lower(Usuario.email) == email.strip().lower()
        )
        return self.session.exec(statement).first()

    def get_all_users(self, skip: int = 0, limit: int = 100) -> List[Usuario]:
        statement = (
            select(Usuario)
            .order_by(Usuario.id)  # type: ignore[arg-type]
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(statement).all())

    def get_active_roles(self, usuario_id: int) -> List[str]:
        """Obtiene los nombres de los roles vigentes del usuario en UsuarioRol (RN-14)."""
        statement = (
            select(Rol.nombre, UsuarioRol.expires_at)
            .join(UsuarioRol, UsuarioRol.rol_id == Rol.id)  # type: ignore[arg-type]
            .where(UsuarioRol.usuario_id == usuario_id)
        )
        rows = self.session.exec(statement).all()
        active_roles: List[str] = []
        for role_name, expires_at in rows:
            if _is_role_active(expires_at) and role_name not in active_roles:
                active_roles.append(role_name)
        return active_roles

    def get_role_by_name(self, nombre: str) -> Optional[Rol]:
        statement = select(Rol).where(
            func.lower(Rol.nombre) == nombre.strip().lower()
        )
        return self.session.exec(statement).first()

    def get_all_roles(self) -> List[Rol]:
        statement = select(Rol).order_by(Rol.id)  # type: ignore[arg-type]
        return list(self.session.exec(statement).all())

    def get_or_create_role(self, nombre: str, descripcion: str = "") -> Rol:
        rol = self.get_role_by_name(nombre)
        if rol is None:
            rol = Rol(nombre=nombre.strip().lower(), descripcion=descripcion)
            self.session.add(rol)
            self.session.flush()
            self.session.refresh(rol)
        return rol

    def assign_role(
        self,
        usuario_id: int,
        rol_id: int,
        asignado_por_id: Optional[int] = None,
        expires_at: Optional[datetime] = None,
    ) -> UsuarioRol:
        existing = self.session.get(UsuarioRol, (usuario_id, rol_id))
        if existing is not None:
            existing.asignado_por_id = asignado_por_id
            existing.expires_at = expires_at
            self.session.add(existing)
            self.session.flush()
            return existing

        enlace = UsuarioRol(
            usuario_id=usuario_id,
            rol_id=rol_id,
            asignado_por_id=asignado_por_id,
            expires_at=expires_at,
        )
        self.session.add(enlace)
        self.session.flush()
        return enlace

    def remove_role(self, usuario_id: int, rol_id: int) -> bool:
        """Elimina físicamente la fila de enlace en UsuarioRol (Consigna e, RN-11)."""
        enlace = self.session.get(UsuarioRol, (usuario_id, rol_id))
        if enlace is None:
            return False
        self.session.delete(enlace)
        self.session.flush()
        return True

    def activate(self, usuario: Usuario) -> Usuario:
        usuario.deleted_at = None
        usuario.updated_at = datetime.now(timezone.utc)
        self.session.add(usuario)
        self.session.flush()
        self.session.refresh(usuario)
        return usuario

    def deactivate(self, usuario: Usuario) -> Usuario:
        usuario.deleted_at = datetime.now(timezone.utc)
        usuario.updated_at = datetime.now(timezone.utc)
        self.session.add(usuario)
        self.session.flush()
        self.session.refresh(usuario)
        return usuario

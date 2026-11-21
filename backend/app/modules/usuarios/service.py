from typing import List
from fastapi import HTTPException, status

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def listar_todos(
        self, skip: int = 0, limit: int = 100
    ) -> List[UserPublic]:
        with self.uow as uow:
            usuarios = uow.usuarios.get_all_users(skip=skip, limit=limit)
            return [UserPublic.model_validate(u) for u in usuarios]

    def activar(self, user_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(user_id)
            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Usuario con id {user_id} no encontrado",
                )
            usuario.disabled = False
            uow.usuarios.update(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(
        self, user_id: int, current_admin_id: int
    ) -> UserPublic:
        if user_id == current_admin_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El administrador no puede desactivarse a sí mismo",
            )
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(user_id)
            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Usuario con id {user_id} no encontrado",
                )
            usuario.disabled = True
            uow.usuarios.update(usuario)
            return UserPublic.model_validate(usuario)
from app.core.unit_of_work import BaseUnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(BaseUnitOfWork):
    usuarios: UsuarioRepository

    def __enter__(self):
        super().__enter__()
        assert self.session is not None
        self.usuarios = UsuarioRepository(self.session)
        return self
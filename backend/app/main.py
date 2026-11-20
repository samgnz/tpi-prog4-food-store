from contextlib import asynccontextmanager
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.categoria.model import Categoria  # noqa: F401
from app.categoria.router import router as categoria_router
from app.core.database import create_db_and_tables
from app.modules.usuarios.models import Rol, Usuario, UsuarioRol  # noqa: F401
from app.modules.usuarios.router import (
    roles_router,
    router as usuarios_auth_router,
)
from app.pedidos.models import (  # noqa: F401
    DetallePedido,
    DireccionEntrega,
    EstadoPedido,
    FormaPago,
    HistorialEstadoPedido,
    Pedido,
)
from app.pedidos.router import (
    direcciones_router,
    estados_pedido_router,
    formas_pago_router,
    router as pedidos_router,
)
from app.producto.model import Producto, ProductoCategoria  # noqa: F401
from app.producto.router import router as producto_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="Food Store API - TP Integrador Unidad 9",
        description=(
            "API RESTful con autenticación JWT en cookie HttpOnly, gestión de usuarios, "
            "autorización RBAC por roles (Usuario, Rol, UsuarioRol) y borrado lógico."
        ),
        version="3.0.0",
        lifespan=lifespan,
    )

    # Consigna d) CORS con credenciales para envío y recepción de cookie HttpOnly
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 1. Router de autenticación y usuarios en /api/v1/auth (Consigna b)
    app.include_router(usuarios_auth_router)

    # Alias /auth/* para compatibilidad directa si se invoca sin prefijo /api/v1
    from typing import List
    from fastapi import status
    from app.modules.usuarios import router as auth_handlers
    from app.modules.usuarios.schemas import UserPublic

    short_auth_router = APIRouter(prefix="/auth", include_in_schema=False)
    short_auth_router.add_api_route(
        "/register",
        auth_handlers.register,
        methods=["POST"],
        response_model=UserPublic,
        status_code=status.HTTP_201_CREATED,
    )
    short_auth_router.add_api_route(
        "/token",
        auth_handlers.login_for_access_token,
        methods=["POST"],
        status_code=status.HTTP_200_OK,
    )
    short_auth_router.add_api_route(
        "/logout",
        auth_handlers.logout,
        methods=["POST"],
        status_code=status.HTTP_200_OK,
    )
    short_auth_router.add_api_route(
        "/me",
        auth_handlers.read_users_me,
        methods=["GET"],
        response_model=UserPublic,
        status_code=status.HTTP_200_OK,
    )
    short_auth_router.add_api_route(
        "/admin/usuarios",
        auth_handlers.list_users_admin,
        methods=["GET"],
        response_model=List[UserPublic],
        status_code=status.HTTP_200_OK,
    )
    short_auth_router.add_api_route(
        "/admin/usuarios/{id}/activar",
        auth_handlers.activate_user_admin,
        methods=["POST"],
        response_model=UserPublic,
        status_code=status.HTTP_200_OK,
    )
    short_auth_router.add_api_route(
        "/admin/usuarios/{id}/desactivar",
        auth_handlers.deactivate_user_admin,
        methods=["POST"],
        response_model=UserPublic,
        status_code=status.HTTP_200_OK,
    )
    app.include_router(short_auth_router)

    # 2. Routers de Catálogo de Productos, Pedidos y Catálogos de solo lectura
    domain_routers = [
        categoria_router,
        producto_router,
        pedidos_router,
        roles_router,
        estados_pedido_router,
        formas_pago_router,
        direcciones_router,
    ]
    for r in domain_routers:
        app.include_router(r)
        app.include_router(r, prefix="/api/v1", include_in_schema=False)

    return app


app = create_app()

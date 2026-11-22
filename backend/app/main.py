from contextlib import asynccontextmanager
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.models import Categoria 
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.models import DetallePedido, Pedido 
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.models import Producto 
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.models import Usuario  
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="Food Store API",
        description=(
            "API REST de Food Store — Trabajo Práctico Integrador de Programación 4. "
            "Autenticación con JWT en cookie HttpOnly, autorización por roles y Unit of Work."
        ),
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_ORIGIN],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    api_v1 = APIRouter(prefix="/api/v1")
    api_v1.include_router(auth_router)
    api_v1.include_router(usuarios_router)
    api_v1.include_router(categorias_router)
    api_v1.include_router(productos_router)
    api_v1.include_router(pedidos_router)

    app.include_router(api_v1)
    return app


app = create_app()
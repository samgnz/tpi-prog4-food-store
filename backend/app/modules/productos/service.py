from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.categoria.model import Categoria
from app.producto.model import Producto, ProductoCategoria
from app.producto.schema import ProductoCreate, ProductoUpdate


def _cargar_categorias(
    session: Session, categoria_ids: List[int]
) -> List[Categoria]:
    categorias: List[Categoria] = []
    vistos: set[int] = set()
    for cat_id in categoria_ids:
        if cat_id in vistos:
            continue
        vistos.add(cat_id)
        categoria = session.get(Categoria, cat_id)
        if not categoria or categoria.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categoría con id {cat_id} no encontrada",
            )
        categorias.append(categoria)
    return categorias


def _sincronizar_enlaces_categorias(
    session: Session, producto_id: int, categorias: List[Categoria]
) -> None:
    """Sincroniza las filas de ProductoCategoria marcando la primera como es_principal=True."""
    existentes = session.exec(
        select(ProductoCategoria).where(
            ProductoCategoria.producto_id == producto_id
        )
    ).all()
    for enlace in existentes:
        session.delete(enlace)
    session.flush()

    for idx, cat in enumerate(categorias):
        assert cat.id is not None
        session.add(
            ProductoCategoria(
                producto_id=producto_id,
                categoria_id=cat.id,
                es_principal=(idx == 0),
            )
        )
    session.flush()


def crear(session: Session, data: ProductoCreate) -> Producto:
    datos_producto = data.model_dump(exclude={"categoria_ids"})
    nuevo_producto = Producto(**datos_producto)

    categorias = (
        _cargar_categorias(session, data.categoria_ids)
        if data.categoria_ids
        else []
    )

    session.add(nuevo_producto)
    session.flush()
    assert nuevo_producto.id is not None

    if categorias:
        _sincronizar_enlaces_categorias(session, nuevo_producto.id, categorias)

    session.commit()
    session.refresh(nuevo_producto)
    return nuevo_producto


def obtener_todos(
    session: Session,
    skip: int = 0,
    limit: int = 100,
    disponible: bool | None = None,
) -> List[Producto]:
    query = (
        select(Producto)
        .where(Producto.deleted_at == None)  # noqa: E711
        .order_by(Producto.id)  # type: ignore[arg-type]
    )
    if disponible is not None:
        query = query.where(Producto.disponible == disponible)
    productos = list(session.exec(query.offset(skip).limit(limit)).all())
    for p in productos:
        p.categorias = [c for c in p.categorias if c.deleted_at is None]
    return productos


def obtener_por_id(session: Session, id: int) -> Producto:
    producto = session.get(Producto, id)
    if not producto or producto.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )
    producto.categorias = [
        c for c in producto.categorias if c.deleted_at is None
    ]
    return producto


def actualizar_total(
    session: Session, id: int, data: ProductoUpdate
) -> Producto:
    producto = obtener_por_id(session, id)

    cambios = data.model_dump(exclude_unset=True, exclude={"categoria_ids"})
    producto.sqlmodel_update(cambios)
    producto.updated_at = datetime.now(timezone.utc)
    session.add(producto)
    session.flush()

    if data.categoria_ids is not None:
        assert producto.id is not None
        categorias = _cargar_categorias(session, data.categoria_ids)
        _sincronizar_enlaces_categorias(session, producto.id, categorias)

    session.commit()
    session.refresh(producto)
    producto.categorias = [
        c for c in producto.categorias if c.deleted_at is None
    ]
    return producto


def eliminar(session: Session, id: int) -> None:
    """Borrado lógico de producto: completa deleted_at con la fecha actual (Consigna e, RN-11)."""
    producto = obtener_por_id(session, id)
    now = datetime.now(timezone.utc)
    producto.deleted_at = now
    producto.updated_at = now
    session.add(producto)
    session.commit()


def asociar_categoria(
    session: Session,
    producto_id: int,
    categoria_id: int,
    es_principal: bool = False,
) -> Producto:
    producto = obtener_por_id(session, producto_id)
    categoria = session.get(Categoria, categoria_id)
    if not categoria or categoria.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )

    enlace_existente = session.get(
        ProductoCategoria, (producto_id, categoria_id)
    )
    if enlace_existente is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El producto ya tiene asociada esta categoría",
        )

    if es_principal:
        otros_enlaces = session.exec(
            select(ProductoCategoria).where(
                ProductoCategoria.producto_id == producto_id
            )
        ).all()
        for otro in otros_enlaces:
            otro.es_principal = False
            session.add(otro)

    nuevo_enlace = ProductoCategoria(
        producto_id=producto_id,
        categoria_id=categoria_id,
        es_principal=es_principal,
    )
    session.add(nuevo_enlace)
    producto.updated_at = datetime.now(timezone.utc)
    session.add(producto)
    session.commit()
    session.refresh(producto)
    producto.categorias = [
        c for c in producto.categorias if c.deleted_at is None
    ]
    return producto


def listar_categorias_de_producto(
    session: Session, producto_id: int
) -> List[Categoria]:
    producto = obtener_por_id(session, producto_id)
    return [c for c in producto.categorias if c.deleted_at is None]


def desasociar_categoria(
    session: Session, producto_id: int, categoria_id: int
) -> Producto:
    """Elimina físicamente la fila de enlace en ProductoCategoria (Consigna e, RN-11)."""
    producto = obtener_por_id(session, producto_id)
    enlace = session.get(ProductoCategoria, (producto_id, categoria_id))
    if enlace is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La categoría no está asociada a este producto",
        )
    session.delete(enlace)
    producto.updated_at = datetime.now(timezone.utc)
    session.add(producto)
    session.commit()
    session.refresh(producto)
    producto.categorias = [
        c for c in producto.categorias if c.deleted_at is None
    ]
    return producto


def buscar_por_nombre(
    session: Session, nombre: str, excluir_id: Optional[int] = None
) -> Producto | None:
    query = select(Producto).where(
        Producto.nombre == nombre,
        Producto.deleted_at == None,  # noqa: E711
    )
    if excluir_id is not None:
        query = query.where(Producto.id != excluir_id)
    return session.exec(query).first()

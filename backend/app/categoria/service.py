from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlmodel import Session, select

from app.categoria.model import Categoria
from app.categoria.schema import CategoriaCreate, CategoriaUpdate


def crear(session: Session, data: CategoriaCreate) -> Categoria:
    existente = buscar_por_nombre(session, data.nombre, incluir_eliminadas=True)
    if existente is not None:
        if existente.deleted_at is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe una categoría con el nombre {data.nombre}",
            )
        # Si estaba borrada lógicamente, se reactiva y actualiza
        existente.nombre = data.nombre.strip()
        existente.descripcion = data.descripcion
        existente.deleted_at = None
        existente.updated_at = datetime.now(timezone.utc)
        session.add(existente)
        session.commit()
        session.refresh(existente)
        return existente

    nueva_categoria = Categoria(**data.model_dump())
    session.add(nueva_categoria)
    session.commit()
    session.refresh(nueva_categoria)
    return nueva_categoria


def obtener_todas(
    session: Session, skip: int = 0, limit: int = 100
) -> List[Categoria]:
    query = (
        select(Categoria)
        .where(Categoria.deleted_at == None)  # noqa: E711
        .order_by(Categoria.id)  # type: ignore[arg-type]
        .offset(skip)
        .limit(limit)
    )
    return list(session.exec(query).all())


def obtener_por_id(session: Session, id: int) -> Categoria:
    categoria = session.get(Categoria, id)
    if not categoria or categoria.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )
    return categoria


def actualizar_total(
    session: Session, id: int, data: CategoriaUpdate
) -> Categoria:
    categoria = obtener_por_id(session, id)

    if data.nombre and buscar_por_nombre(
        session, data.nombre, excluir_id=id, incluir_eliminadas=True
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe otra categoría con el nombre {data.nombre}",
        )

    cambios = data.model_dump(exclude_unset=True)
    categoria.sqlmodel_update(cambios)
    categoria.updated_at = datetime.now(timezone.utc)

    session.add(categoria)
    session.commit()
    session.refresh(categoria)
    return categoria


def eliminar(session: Session, id: int) -> None:
    """Borrado lógico de categoría: completa deleted_at con la fecha actual (Consigna e, RN-11)."""
    categoria = obtener_por_id(session, id)
    now = datetime.now(timezone.utc)
    categoria.deleted_at = now
    categoria.updated_at = now
    session.add(categoria)
    session.commit()


def buscar_por_nombre(
    session: Session,
    nombre: str,
    excluir_id: int | None = None,
    incluir_eliminadas: bool = False,
) -> Categoria | None:
    query = select(Categoria).where(
        func.lower(Categoria.nombre) == nombre.strip().lower()
    )
    if not incluir_eliminadas:
        query = query.where(Categoria.deleted_at == None)  # noqa: E711
    if excluir_id is not None:
        query = query.where(Categoria.id != excluir_id)
    return session.exec(query).first()

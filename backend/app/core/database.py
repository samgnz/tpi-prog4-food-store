from sqlalchemy import create_engine as sa_create_engine, text
from sqlalchemy.engine import make_url
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

connect_args = (
    {"check_same_thread": False}
    if settings.DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args,
)


def _ensure_database_exists() -> None:
    """Si la URL es PostgreSQL y la base de datos aún no existe en el servidor,
    se conecta a la base 'postgres' y la crea automáticamente.
    """
    try:
        url = make_url(settings.DATABASE_URL)
        target_db = url.database
        if not target_db or not url.drivername.startswith("postgresql"):
            return

        admin_url = url.set(database="postgres").render_as_string(
            hide_password=False
        )
        admin_engine = sa_create_engine(
            admin_url, isolation_level="AUTOCOMMIT"
        )
        try:
            with admin_engine.connect() as conn:
                exists = conn.execute(
                    text("SELECT 1 FROM pg_database WHERE datname = :dbname"),
                    {"dbname": target_db},
                ).scalar()
                if not exists:
                    safe_db_name = target_db.replace('"', '""')
                    conn.execute(text(f'CREATE DATABASE "{safe_db_name}"'))
                    print(f"Base de datos '{target_db}' creada automáticamente.")
        finally:
            admin_engine.dispose()
    except Exception as exc:
        print(f"Aviso al verificar existencia de la base de datos: {exc}")


def session_factory() -> Session:
    return Session(engine)


def create_all_tables() -> None:
    _ensure_database_exists()
    SQLModel.metadata.create_all(engine)


# Alias por compatibilidad con imports existentes
create_db_and_tables = create_all_tables


def get_session():
    with session_factory() as session:
        yield session
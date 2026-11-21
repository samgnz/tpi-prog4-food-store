import os
from dotenv import load_dotenv
from sqlalchemy import text
from sqlmodel import Session, SQLModel, create_engine

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:1234@localhost:5432/foodstore_db",
)

engine = create_engine(
    DATABASE_URL,
    echo=False,
)

def _ensure_database_exists() -> None:
    try:
        url = make_url(DATABASE_URL)
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
        # Si falla la conexión o el usuario no tiene permisos de CREATEDB, continúa normalmente
        print(f"Aviso al verificar existencia de la base de datos: {exc}")


def _migrate_existing_tables() -> None:
    """Asegura que las tablas heredadas de la Unidad 8 tengan las columnas de auditoría,
    borrado lógico y enlace requeridas en la Unidad 9.
    """
    alter_statements = [
        "ALTER TABLE IF EXISTS categorias ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()",
        "ALTER TABLE IF EXISTS categorias ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",
        "ALTER TABLE IF EXISTS categorias ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL",
        "ALTER TABLE IF EXISTS productos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()",
        "ALTER TABLE IF EXISTS productos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",
        "ALTER TABLE IF EXISTS productos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL",
        "ALTER TABLE IF EXISTS producto_categoria ADD COLUMN IF NOT EXISTS es_principal BOOLEAN DEFAULT FALSE",
        "ALTER TABLE IF EXISTS pedidos ADD COLUMN IF NOT EXISTS usuario_id INTEGER NULL REFERENCES usuarios(id)",
        "ALTER TABLE IF EXISTS pedidos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()",
        "ALTER TABLE IF EXISTS pedidos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",
        "ALTER TABLE IF EXISTS pedidos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL",
    ]
    with engine.begin() as conn:
        for stmt in alter_statements:
            conn.execute(text(stmt))


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
    _migrate_existing_tables()


def get_session():
    with Session(engine) as session:
        yield session

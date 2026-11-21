"""Script idempotente de carga de datos iniciales (seed) para Food Store."""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import get_password_hash
from app.modules.categorias.models import Categoria
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario


def run_seed() -> None:
    create_all_tables()

    with Session(engine) as session:
        # 1. Usuario administrador obligatorio del TPI (admin / Admin1234!)
        admin = session.exec(
            select(Usuario).where(Usuario.username == "admin")
        ).first()
        if not admin:
            admin = Usuario(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=get_password_hash("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin)
            session.flush()

        # 2. Categorías (al menos 3 requeridas; cargamos 4)
        categorias_data = [
            ("Pizzas", "Pizzas artesanales a la piedra con masa madre"),
            ("Hamburguesas", "Hamburguesas caseras con medallón de carne vacuna"),
            ("Empanadas", "Empanadas horneadas y fritas tradicionales"),
            ("Bebidas", "Gaseosas, aguas saborizadas y cervezas artesanales"),
        ]
        categorias_map: dict[str, Categoria] = {}
        for nombre, descripcion in categorias_data:
            cat = session.exec(
                select(Categoria).where(Categoria.nombre == nombre)
            ).first()
            if not cat:
                cat = Categoria(
                    nombre=nombre,
                    descripcion=descripcion,
                    activo=True,
                )
                session.add(cat)
                session.flush()
            categorias_map[nombre] = cat

        # 3. Productos con stock (al menos 8 requeridos; chequeo idempotente por nombre)
        productos_data = [
            (
                "Pizza Muzzarella",
                "Salsa de tomate casera, abundante muzzarella, orégano y aceitunas",
                12500.0,
                "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
                20,
                "Pizzas",
            ),
            (
                "Pizza Napolitana",
                "Muzzarella, rodajas de tomate natural, ajo y albahaca fresca",
                14200.0,
                "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=600",
                15,
                "Pizzas",
            ),
            (
                "Hamburguesa Doble Cheddar",
                "Doble medallón de carne, doble cheddar, panceta crocante y salsa especial",
                11800.0,
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
                25,
                "Hamburguesas",
            ),
            (
                "Hamburguesa Clásica",
                "Medallón de carne vacuna, lechuga, tomate, queso tybo y mayonesa casera",
                9800.0,
                "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600",
                18,
                "Hamburguesas",
            ),
            (
                "Docena de Empanadas de Carne",
                "12 empanadas criollas de carne cortada a cuchillo al horno de barro",
                16000.0,
                "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
                12,
                "Empanadas",
            ),
            (
                "Media Docena Jamón y Queso",
                "6 empanadas rellenas de jamón cocido natural y queso cremoso",
                8500.0,
                "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600",
                20,
                "Empanadas",
            ),
            (
                "Gaseosa Cola 1.5L",
                "Botella familiar bien fría de 1.5 litros",
                3500.0,
                "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600",
                40,
                "Bebidas",
            ),
            (
                "Cerveza Artesanal IPA 500ml",
                "Lata de cerveza artesanal estilo IPA con notas cítricas",
                4800.0,
                "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600",
                30,
                "Bebidas",
            ),
        ]

        for nombre, descripcion, precio, imagen_url, stock, cat_nombre in productos_data:
            existente = session.exec(
                select(Producto).where(Producto.nombre == nombre)
            ).first()
            if not existente:
                cat_obj = categorias_map[cat_nombre]
                assert cat_obj.id is not None
                session.add(
                    Producto(
                        categoria_id=cat_obj.id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=imagen_url,
                        stock=stock,
                        disponible=True,
                        activo=True,
                    )
                )

        session.commit()
        print("Seed de Food Store ejecutado correctamente.")
        print("  - Admin: admin / Admin1234! (rol: admin)")


if __name__ == "__main__":
    run_seed()
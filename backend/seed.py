"""Script de carga de datos iniciales (seed) para el Trabajo Práctico Unidad 9."""

from sqlmodel import Session, select

from app.categoria.model import Categoria
from app.core.database import create_db_and_tables, engine
from app.core.security import get_password_hash
from app.modules.usuarios.models import Rol, Usuario, UsuarioRol
from app.pedidos.models import (
    DetallePedido,
    EstadoPedido,
    FormaPago,
    HistorialEstadoPedido,
    Pedido,
)
from app.producto.model import Producto, ProductoCategoria


def run_seed() -> None:
    create_db_and_tables()

    with Session(engine) as session:
        # 1. Catálogo de Roles (admin y user — Consigna c, RN-06)
        roles_data = [
            ("admin", "Administrador del sistema con permisos de lectura, escritura y gestión de usuarios"),
            ("user", "Usuario cliente autenticado con permisos de lectura del catálogo y creación de pedidos"),
        ]
        roles_map: dict[str, Rol] = {}
        for nombre_rol, desc_rol in roles_data:
            rol = session.exec(select(Rol).where(Rol.nombre == nombre_rol)).first()
            if not rol:
                rol = Rol(nombre=nombre_rol, descripcion=desc_rol)
                session.add(rol)
                session.flush()
            roles_map[nombre_rol] = rol

        # 2. Usuarios iniciales de prueba (admin y user) con sus filas en UsuarioRol
        usuarios_seed = [
            {
                "nombre": "Erika",
                "apellido": "Admin",
                "email": "admin@foodstore.com",
                "celular": "+5493511112233",
                "password": "admin1234",
                "rol": "admin",
            },
            {
                "nombre": "Juan",
                "apellido": "Cliente",
                "email": "user@foodstore.com",
                "celular": "+5493514445566",
                "password": "user1234",
                "rol": "user",
            },
        ]
        usuarios_map: dict[str, Usuario] = {}
        for u_data in usuarios_seed:
            usuario = session.exec(
                select(Usuario).where(Usuario.email == u_data["email"])
            ).first()
            if not usuario:
                usuario = Usuario(
                    nombre=u_data["nombre"],
                    apellido=u_data["apellido"],
                    email=u_data["email"],
                    celular=u_data["celular"],
                    password_hash=get_password_hash(u_data["password"]),
                )
                session.add(usuario)
                session.flush()
            usuarios_map[u_data["rol"]] = usuario

            rol_obj = roles_map[u_data["rol"]]
            if usuario.id is not None and rol_obj.id is not None:
                enlace = session.get(UsuarioRol, (usuario.id, rol_obj.id))
                if not enlace:
                    session.add(
                        UsuarioRol(
                            usuario_id=usuario.id,
                            rol_id=rol_obj.id,
                            asignado_por_id=None,
                            expires_at=None,
                        )
                    )
                    session.flush()

        # 3. Catálogo EstadoPedido (los 6 estados del diagrama — Consigna c, RN-06)
        estados_data = [
            ("PENDIENTE", "Pedido registrado pendiente de confirmación"),
            ("CONFIRMADO", "Pedido confirmado por el local"),
            ("EN_PREPARACION", "Pedido en preparación en la cocina"),
            ("EN_CAMINO", "Pedido en camino al domicilio de entrega"),
            ("ENTREGADO", "Pedido entregado exitosamente al cliente"),
            ("CANCELADO", "Pedido cancelado"),
        ]
        for nombre_est, desc_est in estados_data:
            est = session.exec(
                select(EstadoPedido).where(EstadoPedido.nombre == nombre_est)
            ).first()
            if not est:
                session.add(EstadoPedido(nombre=nombre_est, descripcion=desc_est))

        # 4. Catálogo FormaPago (Consigna c, RN-06)
        formas_pago_data = [
            ("EFECTIVO", "Pago en efectivo contra entrega"),
            ("TARJETA_DEBITO", "Pago con tarjeta de débito"),
            ("TARJETA_CREDITO", "Pago con tarjeta de crédito"),
            ("TRANSFERENCIA", "Pago mediante transferencia bancaria o QR"),
        ]
        for nombre_fp, desc_fp in formas_pago_data:
            fp = session.exec(
                select(FormaPago).where(FormaPago.nombre == nombre_fp)
            ).first()
            if not fp:
                session.add(FormaPago(nombre=nombre_fp, descripcion=desc_fp))

        # 5. Categorías del Catálogo de Productos
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
                cat = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(cat)
                session.flush()
            categorias_map[nombre] = cat

        # 6. Productos y asignación en ProductoCategoria (con es_principal=True)
        productos_existentes = session.exec(select(Producto)).all()
        if not productos_existentes:
            productos_seed = [
                (
                    "Pizza Muzzarella",
                    "Salsa de tomate casera, abundante muzzarella, orégano y aceitunas",
                    12500.0,
                    ["https://ejemplo.com/pizza-muzza.jpg"],
                    "Pizzas",
                ),
                (
                    "Pizza Napolitana",
                    "Muzzarella, rodajas de tomate natural, ajo y albahaca fresca",
                    14200.0,
                    ["https://ejemplo.com/pizza-napo.jpg"],
                    "Pizzas",
                ),
                (
                    "Hamburguesa Doble Cheddar",
                    "Doble medallón de carne, doble cheddar, panceta crocante y salsa especial",
                    11800.0,
                    ["https://ejemplo.com/burger-cheddar.jpg"],
                    "Hamburguesas",
                ),
                (
                    "Docena de Empanadas",
                    "12 empanadas a elección (carne cortada a cuchillo, jamón y queso, pollo)",
                    16000.0,
                    ["https://ejemplo.com/empanadas.jpg"],
                    "Empanadas",
                ),
            ]
            creados: list[Producto] = []
            for nom, desc, precio, imgs, cat_nom in productos_seed:
                prod = Producto(
                    nombre=nom,
                    descripcion=desc,
                    precio_base=precio,
                    imagenes_url=imgs,
                    disponible=True,
                )
                session.add(prod)
                session.flush()
                cat_obj = categorias_map[cat_nom]
                if prod.id is not None and cat_obj.id is not None:
                    session.add(
                        ProductoCategoria(
                            producto_id=prod.id,
                            categoria_id=cat_obj.id,
                            es_principal=True,
                        )
                    )
                creados.append(prod)
            session.flush()

            # 7. Pedido de ejemplo asociado al usuario cliente
            user_cliente = usuarios_map.get("user")
            p1, p3 = creados[0], creados[2]
            if p1.id is not None and p3.id is not None:
                pedido = Pedido(
                    usuario_id=user_cliente.id if user_cliente else None,
                    estado="PENDIENTE",
                    total=(2 * p1.precio_base) + (1 * p3.precio_base),
                )
                session.add(pedido)
                session.flush()
                if pedido.id is not None:
                    session.add_all(
                        [
                            DetallePedido(
                                pedido_id=pedido.id,
                                producto_id=p1.id,
                                cantidad=2,
                                precio_unitario=p1.precio_base,
                            ),
                            DetallePedido(
                                pedido_id=pedido.id,
                                producto_id=p3.id,
                                cantidad=1,
                                precio_unitario=p3.precio_base,
                            ),
                            HistorialEstadoPedido(
                                pedido_id=pedido.id,
                                estado="PENDIENTE",
                                cambiado_por_id=user_cliente.id
                                if user_cliente
                                else None,
                            ),
                        ]
                    )

        session.commit()
        print("Datos de prueba (seed) de la Unidad 9 cargados correctamente.")
        print("  - Admin:   admin@foodstore.com / admin1234")
        print("  - Usuario: user@foodstore.com  / user1234")


if __name__ == "__main__":
    run_seed()

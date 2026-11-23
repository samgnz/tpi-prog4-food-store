import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { EmptyState } from "@/shared/components/StatusStates";
import { useCartStore } from "@/store/cartStore";

export const CarritoPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const items = useCartStore((state) => state.items);
    const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
    const quitar = useCartStore((state) => state.quitar);
    const vaciar = useCartStore((state) => state.vaciar);
    const total = useCartStore((state) => state.total());

    if (items.length === 0) {
        return (
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Tu carrito
                </h2>
                <EmptyState
                    title="Tu carrito está vacío"
                    description="Agregá productos desde el catálogo para armar tu pedido."
                    actionLabel="Explorar catálogo"
                    onAction={() => navigate("/")}
                />
            </section>
        );
    }

    const handleVaciar = () => {
        if (window.confirm("¿Querés vaciar todos los productos del carrito?")) {
            vaciar();
        }
    };

    return (
        <section className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        Tu carrito
                    </h2>
                    <p className="text-xs text-slate-500">
                        Revisá las cantidades antes de confirmar tu pedido
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleVaciar}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors cursor-pointer"
                >
                    Vaciar carrito
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                {items.map((item) => {
                    const subtotal = item.precio_unitario * item.cantidad;
                    const enTope =
                        item.stock_maximo !== undefined &&
                        item.cantidad >= item.stock_maximo;

                    return (
                        <div
                            key={item.producto_id}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                    {item.imagen_url ? (
                                        <img
                                            src={item.imagen_url}
                                            alt={item.nombre}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">
                                            🍽️
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">
                                        {item.nombre}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Precio unitario: $
                                        {item.precio_unitario.toLocaleString("es-AR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            cambiarCantidad(item.producto_id, item.cantidad - 1)
                                        }
                                        className="px-2.5 py-1 text-sm font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                                    >
                                        −
                                    </button>
                                    <span className="px-3 py-1 text-sm font-semibold text-slate-800 bg-slate-50 min-w-[2.25rem] text-center">
                                        {item.cantidad}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={enTope}
                                        onClick={() =>
                                            cambiarCantidad(item.producto_id, item.cantidad + 1)
                                        }
                                        className="px-2.5 py-1 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        +
                                    </button>
                                </div>

                                <p className="text-sm font-bold text-slate-900 min-w-[6.5rem] text-right">
                                    $
                                    {subtotal.toLocaleString("es-AR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => quitar(item.producto_id)}
                                    className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                                >
                                    Quitar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
                        Total del pedido
                    </p>
                    <p className="text-2xl font-black text-slate-900">
                        $
                        {total.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/"
                        className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Seguir comprando
                    </Link>
                    <button
                        type="button"
                        onClick={() => navigate(user ? "/checkout" : "/login")}
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-[#4338ca] hover:bg-[#3730a3] rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                        {user ? "Continuar al checkout" : "Iniciar sesión para confirmar"}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CarritoPage;
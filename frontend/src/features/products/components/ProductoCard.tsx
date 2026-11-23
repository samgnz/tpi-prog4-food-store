import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import type { Producto } from "../types/product.types";

interface ProductoCardProps {
    producto: Producto;
}

export const ProductoCard = ({ producto }: ProductoCardProps) => {
    const agregar = useCartStore((state) => state.agregar);
    const itemEnCarrito = useCartStore((state) =>
        state.items.find((i) => i.producto_id === producto.id)
    );
    const showNotification = useNotificationStore(
        (state) => state.showNotification
    );

    const sinStock = !producto.disponible || producto.stock <= 0;
    const limiteAlcanzado =
        itemEnCarrito !== undefined && itemEnCarrito.cantidad >= producto.stock;

    const handleAgregar = () => {
        if (sinStock || limiteAlcanzado) return;
        agregar({
            producto_id: producto.id,
            nombre: producto.nombre,
            precio_unitario: producto.precio_base,
            imagen_url: producto.imagen_url,
            stock_maximo: producto.stock,
        });
        showNotification(`"${producto.nombre}" agregado al carrito`);
    };

    return (
        <article className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md">
            <div>
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                    {producto.imagen_url ? (
                        <img
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl select-none">
                            🍽️
                        </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 text-indigo-700 shadow-sm">
                        {producto.categoria.nombre}
                    </span>
                </div>

                <div className="p-4 space-y-2">
                    <h3 className="text-base font-bold text-slate-800 leading-snug">
                        {producto.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                        {producto.descripcion || "Sin descripción disponible."}
                    </p>
                </div>
            </div>

            <div className="px-4 pb-4 pt-2 border-t border-slate-50 flex items-center justify-between gap-2">
                <div>
                    <p className="text-lg font-extrabold text-slate-900">
                        $
                        {producto.precio_base.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </p>
                    <p
                        className={`text-[11px] font-medium ${sinStock ? "text-red-600" : "text-emerald-600"
                            }`}
                    >
                        {!producto.disponible
                            ? "No disponible"
                            : producto.stock > 0
                                ? `Stock: ${producto.stock}`
                                : "Sin stock"}
                    </p>
                </div>

                <button
                    type="button"
                    disabled={sinStock || limiteAlcanzado}
                    onClick={handleAgregar}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-[#4338ca] hover:bg-[#3730a3] disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                    {sinStock
                        ? "No disponible"
                        : limiteAlcanzado
                            ? "Máximo en carrito"
                            : itemEnCarrito
                                ? `Agregar (${itemEnCarrito.cantidad})`
                                : "Agregar al carrito"}
                </button>
            </div>
        </article>
    );
};
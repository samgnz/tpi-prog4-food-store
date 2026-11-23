import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeEstado } from "@/shared/components/BadgeEstado";
import { Paginacion } from "@/shared/components/Paginacion";
import {
    EmptyState,
    ErrorState,
    LoadingState,
} from "@/shared/components/StatusStates";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";

const LIMIT = 10;

export const MisPedidosPage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const { pedidos, total, isLoading, isError, error, refetch } = usePedidos({
        skip: page * LIMIT,
        limit: LIMIT,
    });
    const cancelarMutation = useCancelarPedido();

    const handleCancelar = (pedidoId: number) => {
        const confirmar = window.confirm(
            `¿Estás seguro de que querés cancelar el pedido #${pedidoId}? Se restituirá el stock de los productos.`
        );
        if (confirmar) {
            cancelarMutation.mutate(pedidoId);
        }
    };

    if (isLoading) {
        return <LoadingState message="Cargando tus pedidos..." />;
    }

    if (isError) {
        return (
            <ErrorState
                title="No se pudieron cargar tus pedidos"
                message={error?.message}
                onRetry={() => void refetch()}
            />
        );
    }

    return (
        <section className="space-y-5">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Mis pedidos
                </h2>
                <p className="text-xs text-slate-500">
                    Consultá el estado y detalle de tus compras. Podés cancelar pedidos
                    mientras estén en estado Pendiente.
                </p>
            </div>

            {pedidos.length === 0 ? (
                <EmptyState
                    title="Todavía no realizaste ningún pedido"
                    description="Explorá nuestro catálogo y confirmá tu primera compra."
                    actionLabel="Ir al catálogo"
                    onAction={() => navigate("/")}
                />
            ) : (
                <>
                    <div className="space-y-4">
                        {pedidos.map((pedido) => (
                            <article
                                key={pedido.id}
                                className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2.5">
                                            <h3 className="text-base font-bold text-slate-800">
                                                Pedido #{pedido.id}
                                            </h3>
                                            <BadgeEstado estado={pedido.estado} />
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            {new Date(pedido.created_at).toLocaleString("es-AR")} ·
                                            Pago: <strong>{pedido.forma_pago}</strong>
                                        </p>
                                        <p className="text-xs text-slate-600">
                                            Entrega: {pedido.direccion_entrega}
                                        </p>
                                        {pedido.notas && (
                                            <p className="text-xs italic text-slate-500">
                                                Notas: {pedido.notas}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                                        <p className="text-lg font-black text-slate-900">
                                            $
                                            {pedido.total.toLocaleString("es-AR", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>
                                        {pedido.estado === "PENDIENTE" && (
                                            <button
                                                type="button"
                                                disabled={cancelarMutation.isPending}
                                                onClick={() => handleCancelar(pedido.id)}
                                                className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
                                            >
                                                Cancelar pedido
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="text-slate-400 uppercase border-b border-slate-100">
                                                <th className="py-1.5 pr-3">Producto</th>
                                                <th className="py-1.5 px-3 text-center">Cant.</th>
                                                <th className="py-1.5 px-3 text-right">Precio unit.</th>
                                                <th className="py-1.5 pl-3 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {pedido.items.map((item) => (
                                                <tr key={item.producto_id}>
                                                    <td className="py-2 pr-3 font-medium text-slate-700">
                                                        {item.nombre_producto}
                                                    </td>
                                                    <td className="py-2 px-3 text-center text-slate-600">
                                                        {item.cantidad}
                                                    </td>
                                                    <td className="py-2 px-3 text-right text-slate-600">
                                                        $
                                                        {item.precio_unitario.toLocaleString("es-AR", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </td>
                                                    <td className="py-2 pl-3 text-right font-semibold text-slate-800">
                                                        $
                                                        {item.subtotal.toLocaleString("es-AR", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </article>
                        ))}
                    </div>

                    <Paginacion
                        page={page}
                        limit={LIMIT}
                        total={total}
                        onPageChange={setPage}
                    />
                </>
            )}
        </section>
    );
};

export default MisPedidosPage;
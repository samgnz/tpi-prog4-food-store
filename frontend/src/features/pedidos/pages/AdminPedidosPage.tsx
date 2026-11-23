import { useState } from "react";
import { BadgeEstado } from "@/shared/components/BadgeEstado";
import { Paginacion } from "@/shared/components/Paginacion";
import {
    EmptyState,
    ErrorState,
    LoadingState,
} from "@/shared/components/StatusStates";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import type { EstadoPedido } from "../types/pedido.types";

const LIMIT = 10;

export const AdminPedidosPage = () => {
    const [page, setPage] = useState(0);
    const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | "">("");

    const { pedidos, total, isLoading, isError, error, refetch } = usePedidos({
        skip: page * LIMIT,
        limit: LIMIT,
        estado: estadoFiltro,
    });
    const cambiarEstadoMutation = useCambiarEstadoPedido();

    const handleCambiarEstado = (pedidoId: number, nuevoEstado: EstadoPedido) => {
        const msg =
            nuevoEstado === "CANCELADO"
                ? `¿Cancelar el pedido #${pedidoId}? Se restituirá el stock de sus productos.`
                : `¿Cambiar el pedido #${pedidoId} al estado ${nuevoEstado.replace("_", " ")}?`;
        if (window.confirm(msg)) {
            cambiarEstadoMutation.mutate({ id: pedidoId, estado: nuevoEstado });
        }
    };

    return (
        <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        Gestión de Pedidos
                    </h2>
                    <p className="text-xs text-slate-500">
                        Avanzá o cancelá pedidos según la máquina de estados
                    </p>
                </div>

                <select
                    value={estadoFiltro}
                    onChange={(e) => {
                        setEstadoFiltro(e.target.value as EstadoPedido | "");
                        setPage(0);
                    }}
                    aria-label="Filtrar por estado"
                    className="sm:w-52 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                >
                    <option value="">Todos los estados</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_PREPARACION">En preparación</option>
                    <option value="ENTREGADO">Entregado</option>
                    <option value="CANCELADO">Cancelado</option>
                </select>
            </div>

            {isLoading ? (
                <LoadingState message="Cargando pedidos..." />
            ) : isError ? (
                <ErrorState
                    title="No se pudieron cargar los pedidos"
                    message={error?.message}
                    onRetry={() => void refetch()}
                />
            ) : pedidos.length === 0 ? (
                <EmptyState
                    title="No hay pedidos para mostrar"
                    description={
                        estadoFiltro
                            ? "No existen pedidos en el estado seleccionado."
                            : "Todavía no se registró ningún pedido en el sistema."
                    }
                />
            ) : (
                <>
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-[#f8f9fc] border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                        <th className="py-3 px-4">ID / Fecha</th>
                                        <th className="py-3 px-4">Entrega y Pago</th>
                                        <th className="py-3 px-4">Ítems</th>
                                        <th className="py-3 px-4">Total</th>
                                        <th className="py-3 px-4">Estado</th>
                                        <th className="py-3 px-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pedidos.map((pedido) => (
                                        <tr
                                            key={pedido.id}
                                            className="hover:bg-slate-50/80 transition-colors align-top"
                                        >
                                            <td className="py-3 px-4">
                                                <span className="font-mono font-bold text-slate-800">
                                                    #{pedido.id}
                                                </span>
                                                <p className="text-[11px] text-slate-400">
                                                    {new Date(pedido.created_at).toLocaleString("es-AR")}
                                                </p>
                                                <p className="text-[11px] text-slate-500">
                                                    Usuario ID: #{pedido.usuario_id}
                                                </p>
                                            </td>

                                            <td className="py-3 px-4 text-xs text-slate-600 max-w-xs">
                                                <p className="font-medium text-slate-800">
                                                    {pedido.direccion_entrega}
                                                </p>
                                                <p className="text-slate-500">
                                                    Pago: <strong>{pedido.forma_pago}</strong>
                                                </p>
                                                {pedido.notas && (
                                                    <p className="italic text-slate-400 mt-0.5">
                                                        "{pedido.notas}"
                                                    </p>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 text-xs text-slate-600">
                                                <ul className="space-y-0.5">
                                                    {pedido.items.map((it) => (
                                                        <li key={it.producto_id}>
                                                            <strong>{it.cantidad}x</strong> {it.nombre_producto}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>

                                            <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                $
                                                {pedido.total.toLocaleString("es-AR", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </td>

                                            <td className="py-3 px-4">
                                                <BadgeEstado estado={pedido.estado} />
                                            </td>

                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {pedido.estado === "PENDIENTE" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                disabled={cambiarEstadoMutation.isPending}
                                                                onClick={() =>
                                                                    handleCambiarEstado(
                                                                        pedido.id,
                                                                        "EN_PREPARACION"
                                                                    )
                                                                }
                                                                className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 rounded-lg border border-blue-200 cursor-pointer"
                                                            >
                                                                Preparar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={cambiarEstadoMutation.isPending}
                                                                onClick={() =>
                                                                    handleCambiarEstado(pedido.id, "CANCELADO")
                                                                }
                                                                className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg border border-red-200 cursor-pointer"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </>
                                                    )}
                                                    {pedido.estado === "EN_PREPARACION" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                disabled={cambiarEstadoMutation.isPending}
                                                                onClick={() =>
                                                                    handleCambiarEstado(pedido.id, "ENTREGADO")
                                                                }
                                                                className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 rounded-lg border border-emerald-200 cursor-pointer"
                                                            >
                                                                Entregar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={cambiarEstadoMutation.isPending}
                                                                onClick={() =>
                                                                    handleCambiarEstado(pedido.id, "CANCELADO")
                                                                }
                                                                className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg border border-red-200 cursor-pointer"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </>
                                                    )}
                                                    {(pedido.estado === "ENTREGADO" ||
                                                        pedido.estado === "CANCELADO") && (
                                                            <span className="text-xs italic text-slate-400">
                                                                Finalizado
                                                            </span>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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

export default AdminPedidosPage;
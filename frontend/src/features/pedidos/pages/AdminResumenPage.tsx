import { ErrorState, LoadingState } from "@/shared/components/StatusStates";
import { useResumenPedidos } from "../hooks/usePedidos";

export const AdminResumenPage = () => {
    const { data, isLoading, isError, error, refetch } = useResumenPedidos();

    if (isLoading) {
        return <LoadingState message="Cargando resumen del negocio..." />;
    }

    if (isError || !data) {
        return (
            <ErrorState
                title="No se pudo cargar el resumen"
                message={error?.message}
                onRetry={() => void refetch()}
            />
        );
    }

    const tarjetas = [
        {
            titulo: "Pendientes",
            valor: String(data.pendientes),
            color: "border-l-amber-500 text-amber-700",
            subtitulo: "Esperando preparación",
        },
        {
            titulo: "En preparación",
            valor: String(data.en_preparacion),
            color: "border-l-blue-500 text-blue-700",
            subtitulo: "Actualmente en cocina",
        },
        {
            titulo: "Entregados",
            valor: String(data.entregados),
            color: "border-l-emerald-500 text-emerald-700",
            subtitulo: "Pedidos completados",
        },
        {
            titulo: "Cancelados",
            valor: String(data.cancelados),
            color: "border-l-red-500 text-red-700",
            subtitulo: "Con stock restituido",
        },
        {
            titulo: "Pedidos de hoy",
            valor: String(data.pedidos_hoy),
            color: "border-l-indigo-500 text-indigo-700",
            subtitulo: "Creados en la jornada actual",
        },
        {
            titulo: "Ingresos entregados",
            valor: `$${data.ingresos_entregados.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            color: "border-l-teal-500 text-teal-700",
            subtitulo: "Suma total de pedidos entregados",
        },
    ];

    return (
        <section className="space-y-5">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Resumen del negocio
                </h2>
                <p className="text-xs text-slate-500">
                    Indicadores operativos y facturación de pedidos entregados
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tarjetas.map((t) => (
                    <div
                        key={t.titulo}
                        className={`bg-white rounded-xl border border-slate-100 border-l-4 ${t.color} shadow-sm p-5 space-y-1`}
                    >
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {t.titulo}
                        </p>
                        <p className="text-3xl font-black">{t.valor}</p>
                        <p className="text-[11px] text-slate-400">{t.subtitulo}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AdminResumenPage;
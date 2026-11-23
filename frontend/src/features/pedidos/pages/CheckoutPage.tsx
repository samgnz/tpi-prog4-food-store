import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { EmptyState } from "@/shared/components/StatusStates";
import { useCartStore } from "@/store/cartStore";
import { useCrearPedido } from "../hooks/usePedidos";
import type { FormaPago } from "../types/pedido.types";

interface CheckoutFormValues {
    direccion_entrega: string;
    forma_pago: FormaPago;
    notas: string;
}

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const items = useCartStore((state) => state.items);
    const total = useCartStore((state) => state.total());
    const vaciar = useCartStore((state) => state.vaciar);

    const crearPedidoMutation = useCrearPedido();
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm({
        defaultValues: {
            direccion_entrega: "",
            forma_pago: "EFECTIVO",
            notas: "",
        } as CheckoutFormValues,
        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                await crearPedidoMutation.mutateAsync({
                    items: items.map((i) => ({
                        producto_id: i.producto_id,
                        cantidad: i.cantidad,
                    })),
                    forma_pago: value.forma_pago,
                    direccion_entrega: value.direccion_entrega.trim(),
                    notas: value.notas.trim(),
                });
                vaciar();
                navigate("/mis-pedidos", { replace: true });
            } catch (error: unknown) {
                if (error instanceof Error) {
                    setServerError(error.message);
                } else {
                    setServerError("No se pudo confirmar el pedido.");
                }
            }
        },
    });

    if (items.length === 0) {
        return (
            <EmptyState
                title="No tenés productos en tu carrito"
                description="Volvé al catálogo para seleccionar productos antes de confirmar un pedido."
                actionLabel="Ir al catálogo"
                onAction={() => navigate("/")}
            />
        );
    }

    return (
        <section className="space-y-5">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Confirmar pedido
                </h2>
                <p className="text-xs text-slate-500">
                    Completá los datos de entrega y la forma de pago
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
                    {serverError && (
                        <div
                            role="alert"
                            className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-3 rounded-lg"
                        >
                            {serverError}
                        </div>
                    )}

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            void form.handleSubmit();
                        }}
                        className="space-y-4"
                    >
                        <form.Field
                            name="direccion_entrega"
                            validators={{
                                onChange: ({ value }) => {
                                    const len = value.trim().length;
                                    if (len < 5) {
                                        return "La dirección debe tener al menos 5 caracteres";
                                    }
                                    if (len > 200) {
                                        return "La dirección no puede superar los 200 caracteres";
                                    }
                                    return undefined;
                                },
                                onSubmit: ({ value }) => {
                                    const len = value.trim().length;
                                    if (len < 5) {
                                        return "La dirección debe tener al menos 5 caracteres";
                                    }
                                    if (len > 200) {
                                        return "La dirección no puede superar los 200 caracteres";
                                    }
                                    return undefined;
                                },
                            }}
                        >
                            {(field) => (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Dirección de entrega *
                                    </label>
                                    <input
                                        type="text"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="Ej: Av. Colón 1234, Piso 2 Depto B"
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    />
                                    {field.state.meta.errors.length > 0 && (
                                        <p className="mt-1 text-xs text-red-600 font-medium">
                                            {field.state.meta.errors.join(", ")}
                                        </p>
                                    )}
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="forma_pago">
                            {(field) => (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Forma de pago *
                                    </label>
                                    <select
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value as FormaPago)
                                        }
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    >
                                        <option value="EFECTIVO">Efectivo contra entrega</option>
                                        <option value="TRANSFERENCIA">Transferencia bancaria</option>
                                    </select>
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="notas">
                            {(field) => (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Notas adicionales (opcional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="Ej: Timbre roto, llamar al llegar / Sin aceitunas..."
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    />
                                </div>
                            )}
                        </form.Field>

                        <div className="pt-2 flex items-center justify-end gap-3">
                            <Link
                                to="/carrito"
                                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Volver al carrito
                            </Link>
                            <form.Subscribe
                                selector={(state) => [state.canSubmit, state.isSubmitting]}
                            >
                                {([canSubmit, isSubmitting]) => (
                                    <button
                                        type="submit"
                                        disabled={
                                            !canSubmit ||
                                            Boolean(isSubmitting) ||
                                            crearPedidoMutation.isPending
                                        }
                                        className="px-5 py-2 text-sm font-semibold text-white bg-[#4338ca] hover:bg-[#3730a3] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer"
                                    >
                                        {isSubmitting || crearPedidoMutation.isPending
                                            ? "Confirmando..."
                                            : "Confirmar pedido"}
                                    </button>
                                )}
                            </form.Subscribe>
                        </div>
                    </form>
                </div>

                <aside className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 h-fit">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Resumen de compra
                    </h3>
                    <ul className="divide-y divide-slate-100 text-xs">
                        {items.map((item) => (
                            <li
                                key={item.producto_id}
                                className="py-2 flex items-center justify-between gap-2"
                            >
                                <span className="text-slate-700">
                                    <strong>{item.cantidad}x</strong> {item.nombre}
                                </span>
                                <span className="font-semibold text-slate-900">
                                    $
                                    {(item.precio_unitario * item.cantidad).toLocaleString(
                                        "es-AR",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">Total</span>
                        <span className="text-lg font-black text-[#4338ca]">
                            $
                            {total.toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                </aside>
            </div>
        </section>
    );
};

export default CheckoutPage;
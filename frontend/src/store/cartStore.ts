import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
    producto_id: number;
    nombre: string;
    precio_unitario: number;
    cantidad: number;
    imagen_url?: string;
    stock_maximo?: number;
}

interface CartState {
    items: CartItem[];
    agregar: (item: Omit<CartItem, "cantidad">, cantidad?: number) => void;
    quitar: (producto_id: number) => void;
    cambiarCantidad: (producto_id: number, cantidad: number) => void;
    vaciar: () => void;
    total: () => number;
    cantidadTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            agregar: (producto, cantidad = 1) => {
                set((state) => {
                    const existente = state.items.find(
                        (i) => i.producto_id === producto.producto_id
                    );
                    if (existente) {
                        const nuevaCantidad = existente.cantidad + cantidad;
                        const tope =
                            producto.stock_maximo !== undefined
                                ? Math.min(nuevaCantidad, producto.stock_maximo)
                                : nuevaCantidad;
                        return {
                            items: state.items.map((i) =>
                                i.producto_id === producto.producto_id
                                    ? {
                                        ...i,
                                        cantidad: tope,
                                        stock_maximo: producto.stock_maximo ?? i.stock_maximo,
                                    }
                                    : i
                            ),
                        };
                    }
                    const inicial =
                        producto.stock_maximo !== undefined
                            ? Math.min(cantidad, producto.stock_maximo)
                            : cantidad;
                    if (inicial <= 0) return state;
                    return {
                        items: [...state.items, { ...producto, cantidad: inicial }],
                    };
                });
            },

            quitar: (producto_id) => {
                set((state) => ({
                    items: state.items.filter((i) => i.producto_id !== producto_id),
                }));
            },

            cambiarCantidad: (producto_id, cantidad) => {
                if (cantidad <= 0) {
                    get().quitar(producto_id);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) => {
                        if (i.producto_id !== producto_id) return i;
                        const finalQty =
                            i.stock_maximo !== undefined
                                ? Math.min(cantidad, i.stock_maximo)
                                : cantidad;
                        return { ...i, cantidad: finalQty };
                    }),
                }));
            },

            vaciar: () => set({ items: [] }),

            total: () =>
                get().items.reduce(
                    (acc, item) => acc + item.precio_unitario * item.cantidad,
                    0
                ),

            cantidadTotal: () =>
                get().items.reduce((acc, item) => acc + item.cantidad, 0),
        }),
        {
            name: "foodstore-cart",
        }
    )
);
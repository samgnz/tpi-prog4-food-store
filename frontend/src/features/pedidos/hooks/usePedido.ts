import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/shared/api/api";
import { useNotificationStore } from "@/store/notificationStore";
import type {
    EstadoPedido,
    Pedido,
    PedidoCreatePayload,
    PedidoFiltros,
    PedidosPaginados,
    ResumenPedidos,
} from "../types/pedido.types";

export async function getPedidos(
    filtros: PedidoFiltros = {}
): Promise<PedidosPaginados> {
    try {
        const params: Record<string, string | number> = {};
        if (filtros.skip !== undefined) params.skip = filtros.skip;
        if (filtros.limit !== undefined) params.limit = filtros.limit;
        if (filtros.estado) params.estado = filtros.estado;
        const response = await api.get<PedidosPaginados>("/pedidos", { params });
        return response.data;
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Error al obtener los pedidos"), {
            cause: error,
        });
    }
}

export async function createPedidoApi(
    payload: PedidoCreatePayload
): Promise<Pedido> {
    try {
        const response = await api.post<Pedido>("/pedidos", payload);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "No se pudo confirmar el pedido"), {
            cause: error,
        });
    }
}

export async function cancelarPedidoApi(id: number): Promise<Pedido> {
    try {
        const response = await api.patch<Pedido>(`/pedidos/${id}/cancelar`);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "No se pudo cancelar el pedido"), {
            cause: error,
        });
    }
}

export async function cambiarEstadoPedidoApi(
    id: number,
    estado: EstadoPedido
): Promise<Pedido> {
    try {
        const response = await api.patch<Pedido>(`/pedidos/${id}/estado`, {
            estado,
        });
        return response.data;
    } catch (error: unknown) {
        throw new Error(
            getErrorMessage(error, "No se pudo cambiar el estado del pedido"),
            { cause: error }
        );
    }
}

export async function getResumenPedidos(): Promise<ResumenPedidos> {
    try {
        const response = await api.get<ResumenPedidos>("/pedidos/resumen");
        return response.data;
    } catch (error: unknown) {
        throw new Error(
            getErrorMessage(error, "Error al obtener el resumen de pedidos"),
            { cause: error }
        );
    }
}

export function usePedidos(filtros: PedidoFiltros = { skip: 0, limit: 20 }) {
    const query = useQuery<PedidosPaginados, Error>({
        queryKey: ["pedidos", filtros],
        queryFn: () => getPedidos(filtros),
    });

    return {
        pedidos: query.data?.items ?? [],
        total: query.data?.total ?? 0,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useCrearPedido() {
    const queryClient = useQueryClient();
    const showNotification = useNotificationStore(
        (state) => state.showNotification
    );

    return useMutation({
        mutationFn: (payload: PedidoCreatePayload) => createPedidoApi(payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
            void queryClient.invalidateQueries({ queryKey: ["productos"] });
            void queryClient.invalidateQueries({ queryKey: ["pedidos-resumen"] });
            showNotification("¡Pedido confirmado correctamente!");
        },
        onError: (err: Error) => {
            showNotification(err.message);
        },
    });
}

export function useCancelarPedido() {
    const queryClient = useQueryClient();
    const showNotification = useNotificationStore(
        (state) => state.showNotification
    );

    return useMutation({
        mutationFn: (id: number) => cancelarPedidoApi(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
            void queryClient.invalidateQueries({ queryKey: ["productos"] });
            void queryClient.invalidateQueries({ queryKey: ["pedidos-resumen"] });
            showNotification("Pedido cancelado y stock restituido");
        },
        onError: (err: Error) => {
            showNotification(err.message);
        },
    });
}

export function useCambiarEstadoPedido() {
    const queryClient = useQueryClient();
    const showNotification = useNotificationStore(
        (state) => state.showNotification
    );

    return useMutation({
        mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
            cambiarEstadoPedidoApi(id, estado),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
            void queryClient.invalidateQueries({ queryKey: ["productos"] });
            void queryClient.invalidateQueries({ queryKey: ["pedidos-resumen"] });
            showNotification("Estado del pedido actualizado");
        },
        onError: (err: Error) => {
            showNotification(err.message);
        },
    });
}

export function useResumenPedidos() {
    return useQuery<ResumenPedidos, Error>({
        queryKey: ["pedidos-resumen"],
        queryFn: getResumenPedidos,
    });
}
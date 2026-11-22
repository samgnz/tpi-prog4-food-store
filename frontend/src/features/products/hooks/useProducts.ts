import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/shared/api/api";
import { useNotificationStore } from "@/store/notificationStore";
import type {
  Producto,
  ProductoFiltros,
  ProductoPayload,
  ProductosPaginados,
  ProductoStockPayload,
} from "../types/product.types";

export async function getProductos(
  filtros: ProductoFiltros = {}
): Promise<ProductosPaginados> {
  try {
    const params: Record<string, string | number | boolean> = {};
    if (filtros.skip !== undefined) params.skip = filtros.skip;
    if (filtros.limit !== undefined) params.limit = filtros.limit;
    if (filtros.search && filtros.search.trim()) {
      params.search = filtros.search.trim();
    }
    if (filtros.categoria_id !== undefined) {
      params.categoria_id = filtros.categoria_id;
    }
    if (filtros.disponible !== undefined) {
      params.disponible = filtros.disponible;
    }
    const response = await api.get<ProductosPaginados>("/productos", {
      params,
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Error al obtener los productos"), {
      cause: error,
    });
  }
}

export async function createProductoApi(
  data: ProductoPayload
): Promise<Producto> {
  try {
    const response = await api.post<Producto>("/productos", data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Error al crear el producto"), {
      cause: error,
    });
  }
}

export async function updateProductoApi(
  id: number,
  data: ProductoPayload
): Promise<Producto> {
  try {
    const response = await api.put<Producto>(`/productos/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Error al actualizar el producto"), {
      cause: error,
    });
  }
}

export async function updateProductoStockApi(
  id: number,
  data: ProductoStockPayload
): Promise<Producto> {
  try {
    const response = await api.patch<Producto>(
      `/productos/${id}/stock`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Error al actualizar el stock del producto"),
      { cause: error }
    );
  }
}

export async function deleteProductoApi(id: number): Promise<void> {
  try {
    await api.delete(`/productos/${id}`);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Error al eliminar el producto"), {
      cause: error,
    });
  }
}

export function useProducts(filtros: ProductoFiltros = { skip: 0, limit: 100 }) {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  const query = useQuery<ProductosPaginados, Error>({
    queryKey: ["productos", filtros],
    queryFn: () => getProductos(filtros),
  });

  const createMutation = useMutation({
    mutationFn: (nuevoProducto: ProductoPayload) =>
      createProductoApi(nuevoProducto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification("Producto creado correctamente");
    },
    onError: (err: Error) => {
      showNotification(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoPayload }) =>
      updateProductoApi(id, datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification("Producto actualizado correctamente");
    },
    onError: (err: Error) => {
      showNotification(err.message);
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number;
      datos: ProductoStockPayload;
    }) => updateProductoStockApi(id, datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification("Stock y disponibilidad actualizados");
    },
    onError: (err: Error) => {
      showNotification(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProductoApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification("Producto eliminado correctamente");
    },
    onError: (err: Error) => {
      showNotification(err.message);
    },
  });

  return {
    productos: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createMutation,
    updateMutation,
    updateStockMutation,
    deleteMutation,
  };
}
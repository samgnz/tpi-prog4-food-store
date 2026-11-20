import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/shared/api/api";
import { useNotificationStore } from "@/store/notificationStore";
import type { Producto, ProductoPayload } from "../types/product.types";

export async function getProductos(): Promise<Producto[]> {
  try {
    const response = await api.get<Producto[]>("/productos");
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

export async function deleteProductoApi(id: number): Promise<void> {
  try {
    await api.delete(`/productos/${id}`);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Error al eliminar el producto"), {
      cause: error,
    });
  }
}

export function useProducts() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  const query = useQuery<Producto[], Error>({
    queryKey: ["productos"],
    queryFn: getProductos,
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
    productos: query.data ?? [],
    products: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createMutation,
    updateMutation,
    deleteMutation,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutate,
  };
}

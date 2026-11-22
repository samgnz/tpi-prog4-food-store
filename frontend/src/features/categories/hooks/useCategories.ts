import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/shared/api/api";
import { useNotificationStore } from "@/store/notificationStore";
import type { Categoria, CategoriaPayload } from "../types/category.types";

export async function getCategorias(): Promise<Categoria[]> {
  try {
    const response = await api.get<Categoria[]>("/categorias");
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Error al obtener las categorías"), {
      cause: error,
    });
  }
}

export async function createCategoriaApi(
  data: CategoriaPayload
): Promise<Categoria> {
  try {
    const response = await api.post<Categoria>("/categorias", data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Error al crear la categoría"), {
      cause: error,
    });
  }
}

export async function updateCategoriaApi(
  id: number,
  data: CategoriaPayload
): Promise<Categoria> {
  try {
    const response = await api.put<Categoria>(`/categorias/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Error al actualizar la categoría"),
      { cause: error }
    );
  }
}

export async function deleteCategoriaApi(id: number): Promise<void> {
  try {
    await api.delete(`/categorias/${id}`);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Error al eliminar la categoría"), {
      cause: error,
    });
  }
}

export function useCategories() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  const query = useQuery<Categoria[], Error>({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const createMutation = useMutation({
    mutationFn: (nuevaCategoria: CategoriaPayload) =>
      createCategoriaApi(nuevaCategoria),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categorias"] });
      showNotification("Categoría creada correctamente");
    },
    onError: (err: Error) => {
      showNotification(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaPayload }) =>
      updateCategoriaApi(id, datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categorias"] });
      showNotification("Categoría actualizada correctamente");
    },
    onError: (err: Error) => {
      showNotification(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategoriaApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categorias"] });
      showNotification("Categoría eliminada correctamente");
    },
    onError: (err: Error) => {
      showNotification(err.message);
    },
  });

  return {
    categorias: query.data ?? [],
    categories: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
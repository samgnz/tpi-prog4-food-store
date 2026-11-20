import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/shared/api/api";
import { useNotificationStore } from "@/store/notificationStore";
import type { Ingrediente } from "../types/ingredient.types";

export async function getIngredientes(): Promise<Ingrediente[]> {
  try {
    const response = await api.get<Ingrediente[]>("/ingredientes");
    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Error al obtener los ingredientes"),
      { cause: error }
    );
  }
}

export async function createIngredienteApi(
  data: Omit<Ingrediente, "id">
): Promise<Ingrediente> {
  try {
    const response = await api.post<Ingrediente>("/ingredientes", data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Error al crear el ingrediente"), {
      cause: error,
    });
  }
}

export async function updateIngredienteApi(
  id: number,
  data: Omit<Ingrediente, "id">
): Promise<Ingrediente> {
  try {
    const response = await api.put<Ingrediente>(`/ingredientes/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Error al actualizar el ingrediente"),
      { cause: error }
    );
  }
}

export async function deleteIngredienteApi(id: number): Promise<void> {
  try {
    await api.delete(`/ingredientes/${id}`);
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Error al eliminar el ingrediente"),
      { cause: error }
    );
  }
}

export function useIngredients() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  const query = useQuery<Ingrediente[], Error>({
    queryKey: ["ingredientes"],
    queryFn: getIngredientes,
  });

  const createMutation = useMutation({
    mutationFn: (nuevo: Omit<Ingrediente, "id">) => createIngredienteApi(nuevo),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ingredientes"] });
      showNotification("Ingrediente creado correctamente");
    },
    onError: (err: Error) => {
      showNotification(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number;
      datos: Omit<Ingrediente, "id">;
    }) => updateIngredienteApi(id, datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ingredientes"] });
      showNotification("Ingrediente actualizado correctamente");
    },
    onError: (err: Error) => {
      showNotification(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteIngredienteApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ingredientes"] });
      showNotification("Ingrediente eliminado correctamente");
    },
    onError: (err: Error) => {
      showNotification(err.message);
    },
  });

  return {
    ingredientes: query.data ?? [],
    ingredients: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createMutation,
    updateMutation,
    deleteMutation,
    createIngredient: createMutation.mutateAsync,
    updateIngredient: updateMutation.mutateAsync,
    deleteIngredient: deleteMutation.mutate,
  };
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/shared/api/api";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "../store/authStore";
import type {
  RegisterPayload,
  UsuarioAdmin,
  UsuarioAuth,
} from "../types/auth.types";

export async function registerUser(
  payload: RegisterPayload
): Promise<UsuarioAuth> {
  try {
    const response = await api.post<UsuarioAuth>("/auth/register", payload);
    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "No se pudo completar el registro del usuario"),
      { cause: error }
    );
  }
}

export async function getAdminUsers(): Promise<UsuarioAdmin[]> {
  try {
    const response = await api.get<UsuarioAdmin[]>("/admin/usuarios");
    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Error al obtener el listado de usuarios"),
      { cause: error }
    );
  }
}

export async function activateAdminUser(id: number): Promise<UsuarioAdmin> {
  try {
    const response = await api.post<UsuarioAdmin>(
      `/admin/usuarios/${id}/activar`
    );
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Error al activar el usuario"), {
      cause: error,
    });
  }
}

export async function deactivateAdminUser(id: number): Promise<UsuarioAdmin> {
  try {
    const response = await api.post<UsuarioAdmin>(
      `/admin/usuarios/${id}/desactivar`
    );
    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Error al desactivar el usuario"),
      { cause: error }
    );
  }
}

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checking = useAuthStore((state) => state.checking);
  const storeLogin = useAuthStore((state) => state.login);
  const storeLogout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const clearSession = useAuthStore((state) => state.clearSession);
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  const isAdmin = user?.role === "admin";

  const login = async (username: string, password: string) => {
    try {
      await storeLogin(username, password);
      showNotification("Sesión iniciada correctamente");
    } catch (error: unknown) {
      const msg = getErrorMessage(
        error,
        "Credenciales inválidas. Verificá tu usuario y contraseña."
      );
      showNotification(msg);
      throw new Error(msg, { cause: error });
    }
  };

  const logout = async () => {
    await storeLogout();
    showNotification("Sesión cerrada correctamente");
  };

  const register = async (payload: RegisterPayload) => {
    const created = await registerUser(payload);
    showNotification("Cuenta creada correctamente. Ya podés iniciar sesión.");
    return created;
  };

  return {
    user,
    isLoading,
    checking,
    isAdmin,
    login,
    logout,
    register,
    checkAuth,
    clearSession,
  };
}

export function useAdminUsers() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  const query = useQuery<UsuarioAdmin[], Error>({
    queryKey: ["admin-usuarios"],
    queryFn: getAdminUsers,
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => activateAdminUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-usuarios"] });
      showNotification("Usuario activado correctamente");
    },
    onError: (err: Error) => {
      showNotification(err.message);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => deactivateAdminUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-usuarios"] });
      showNotification("Usuario desactivado correctamente");
    },
    onError: (err: Error) => {
      showNotification(err.message);
    },
  });

  return {
    usuarios: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    activateMutation,
    deactivateMutation,
    isPending: activateMutation.isPending || deactivateMutation.isPending,
  };
}
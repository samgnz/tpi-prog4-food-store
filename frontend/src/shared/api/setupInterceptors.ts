import type { AxiosError } from "axios";
import { useAuthStore } from "@/features/auth";
import { useNotificationStore } from "@/store/notificationStore";
import { api, type FastApiErrorResponse } from "./api";

let isSetup = false;

export function setupInterceptors(): void {
  if (isSetup) return;
  isSetup = true;

  api.interceptors.request.use(
    (config) => config,
    (error: unknown) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<FastApiErrorResponse>) => {
      const status = error.response?.status;
      const requestUrl = error.config?.url ?? "";
      const isAuthLoginOrMe =
        requestUrl.includes("/auth/token") || requestUrl.includes("/auth/me");

      // 401: sin sesión o sesión vencida -> limpia el store y ProtectedRoute redirige a /login
      const detail = error.response?.data?.detail;
      const isAccountDisabled =
        status === 400 &&
        typeof detail === "string" &&
        detail === "Cuenta de usuario desactivada";

      if ((status === 401 && !isAuthLoginOrMe) || isAccountDisabled) {
        useAuthStore.getState().clearSession();
      }

      // 403: sesión válida sin permisos -> muestra notificación de acceso denegado sin cerrar sesión
      if (status === 403) {
        useNotificationStore
          .getState()
          .showNotification(
            "Acceso denegado: no tenés permisos suficientes para realizar esta acción."
          );
      }

      return Promise.reject(error);
    }
  );
}

setupInterceptors();

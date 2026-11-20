import { create } from "zustand";
import { api } from "@/shared/api/api";
import type { AuthState, UsuarioAuth } from "../types/auth.types";

// RA-09: El store de autenticación NO usa persist; la sesión se recupera con GET /auth/me
export const useAuthStore = create<AuthState>()((set) => {
  const verifySession = async () => {
    set({ isLoading: true, checking: true });
    try {
      const response = await api.get<UsuarioAuth>("/auth/me");
      set({ user: response.data, isLoading: false, checking: false });
    } catch {
      set({ user: null, isLoading: false, checking: false });
    }
  };

  return {
    user: null,
    isLoading: true,
    checking: true,

    login: async (email: string, password: string) => {
      const formData = new URLSearchParams();
      formData.append("username", email.trim());
      formData.append("password", password);

      await api.post("/auth/token", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const meResponse = await api.get<UsuarioAuth>("/auth/me");
      set({ user: meResponse.data, isLoading: false, checking: false });
    },

    logout: async () => {
      try {
        await api.post("/auth/logout");
      } finally {
        set({ user: null, isLoading: false, checking: false });
      }
    },

    checkAuth: verifySession,
    checkSession: verifySession,

    clearSession: () => {
      set({ user: null, isLoading: false, checking: false });
    },
  };
});

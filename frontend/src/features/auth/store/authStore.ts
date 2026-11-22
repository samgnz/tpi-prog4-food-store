import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/shared/api/api";
import type { AuthState, UsuarioAuth } from "../types/auth.types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
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

        login: async (username: string, password: string) => {
          const formData = new URLSearchParams();
          formData.append("username", username.trim());
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
    },
    {
      name: "foodstore-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
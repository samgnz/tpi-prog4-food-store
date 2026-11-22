export type UserRole = "user" | "admin";

export interface UsuarioAuth {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  disabled: boolean;
  created_at: string;
}

export type UsuarioAdmin = UsuarioAuth;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: UsuarioAuth | null;
  isLoading: boolean;
  checking: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
}
export interface UsuarioAuth {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  celular?: string | null;
  roles: string[];
}

export interface UsuarioAdmin extends UsuarioAuth {
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  apellido: string;
  email: string;
  celular?: string | null;
  password: string;
}

export interface AuthState {
  user: UsuarioAuth | null;
  isLoading: boolean;
  checking: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
}

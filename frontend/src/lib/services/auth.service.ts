import { ApiClient } from "../api/client";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  career: string;
  semester: number;
  bio?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    // Usamos el método especializado del nuevo ApiClient
    return ApiClient.auth.login(credentials);
  },

  register: async (data: RegisterData) => {
    return ApiClient.auth.register(data);
  },

  // Nota: En la nueva arquitectura, getCurrentUser suele obtenerse
  // decodificando el token de la sesión (NextAuth) o consultando usersService.
  // Si tu backend tiene un endpoint /me, deberías agregarlo a ApiClient.auth
  getCurrentUser: async () => {
    // Si usas NextAuth, esto a veces es redundante, pero si lo necesitas:
    // return ApiClient.get<{ user: any }>('/auth/me'); // Usando path relativo
    return null;
  },

  logout: async () => {
    return ApiClient.auth.logout();
  },
};

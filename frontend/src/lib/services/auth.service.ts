import { ApiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/config";

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
    return ApiClient.post<{ user: any; token: string }>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
  },

  register: async (data: RegisterData) => {
    return ApiClient.post<{ user: any; token: string }>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
  },

  getCurrentUser: async () => {
    return ApiClient.get<{ user: any }>(API_ENDPOINTS.AUTH.ME);
  },

  logout: async () => {
    return ApiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
};

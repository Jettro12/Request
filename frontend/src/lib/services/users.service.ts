import { ApiClient } from "../api/client";

export interface User {
  id: string;
  name: string;
  email: string;
  career: string;
  semester: number;
  bio?: string;
  skills: string[];
  interests: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export const usersService = {
  getAll: async (params?: { career?: string; search?: string }) => {
    // Mapeamos a searchUsers que maneja filtros
    return ApiClient.users.searchUsers({
      career: params?.career,
      query: params?.search,
      page: 1,
      limit: 100, // O el límite que desees por defecto
    });
  },

  getById: async (id: string) => {
    return ApiClient.users.getUserProfile(id);
  },

  search: async (query: string) => {
    return ApiClient.users.searchUsers({ query });
  },

  update: async (id: string, data: Partial<User>) => {
    return ApiClient.users.updateProfile(id, data);
  },
};

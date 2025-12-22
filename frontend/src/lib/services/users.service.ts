import { ApiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/config";

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
    return ApiClient.get<{ users: User[] }>(
      API_ENDPOINTS.USERS.GET_ALL,
      params
    );
  },

  getById: async (id: string) => {
    return ApiClient.get<{ user: User }>(API_ENDPOINTS.USERS.GET_BY_ID(id));
  },

  search: async (query: string) => {
    return ApiClient.get<{ users: User[] }>(API_ENDPOINTS.USERS.SEARCH, {
      q: query,
    });
  },

  update: async (id: string, data: Partial<User>) => {
    return ApiClient.put<{ user: User }>(API_ENDPOINTS.USERS.UPDATE(id), data);
  },
};

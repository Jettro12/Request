import { getSession } from "next-auth/react";
import { getApiUrl } from "@/config/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ==========================================
// INTERFACES
// ==========================================
export interface User {
  id: string;
  name: string;
  email?: string;
  career?: string;
  semester?: number;
  rating?: number;
  reviewCount?: number;
  bio?: string;
  skills?: string[];
  interests?: string[];
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  careerSpace: string;
  skills: string[];
  createdAt: string;
  author: {
    id: string;
    name: string;
    career?: string;
    rating?: number;
  };
}

export interface Request {
  id: string;
  type: string;
  message: string;
  status: string;
  createdAt: string;
  fromUser: User;
  toUser: User;
  _count?: {
    messages: number;
  };
}

export interface UsersResponse {
  users: User[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==========================================
// API CLIENT PRINCIPAL
// ==========================================
export class ApiClient {
  private static async fetchWithAuth(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const session: any = await getSession();
    const token = session?.accessToken || session?.user?.accessToken;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as Record<string, string>),
    };

    return fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: response.statusText };
    }

    if (!response.ok) {
      // FIX: Aseguramos que el error siempre sea un string para el frontend
      throw new ApiError(
        data.message ||
          data.error ||
          `Error ${response.status}: ${response.statusText}`,
        response.status,
        data,
      );
    }

    // FIX: Si el backend no envía { success: true }, se lo inyectamos si el status es 2xx
    if (data && typeof data === "object" && data.success === undefined) {
      return { success: true, data } as any;
    }

    return data;
  }

  static async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const cleanParams = params
      ? Object.entries(params).reduce(
          (acc, [key, value]) => {
            if (value === undefined || value === null) return acc;
            const val = String(value).trim();
            if (val === "" || val === "undefined" || val === "null") return acc;
            acc[key] = value;
            return acc;
          },
          {} as Record<string, any>,
        )
      : undefined;

    const query =
      cleanParams && Object.keys(cleanParams).length > 0
        ? new URLSearchParams(cleanParams).toString()
        : "";

    const fullUrl = query ? `${url}?${query}` : url;
    const response = await this.fetchWithAuth(fullUrl, { method: "GET" });
    return this.handleResponse<T>(response);
  }

  static async post<T>(url: string, body?: any): Promise<T> {
    const response = await this.fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  static async put<T>(url: string, body?: any): Promise<T> {
    const response = await this.fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  static async patch<T>(url: string, body?: any): Promise<T> {
    const response = await this.fetchWithAuth(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  static async delete<T>(url: string): Promise<T> {
    const response = await this.fetchWithAuth(url, { method: "DELETE" });
    return this.handleResponse<T>(response);
  }

  // ==========================================
  // SERVICIOS
  // ==========================================

  static auth = {
    login: async (credentials: any) => {
      const url = getApiUrl("auth", "login");
      return ApiClient.post<ApiResponse>(url, credentials);
    },
    register: async (data: any) => {
      const url = getApiUrl("auth", "register");
      return ApiClient.post<ApiResponse>(url, data);
    },
    logout: async () => {
      const url = getApiUrl("auth", "logout");
      return ApiClient.post<ApiResponse>(url, {});
    },
  };

  static users = {
    getUserProfile: async (
      userId: string,
    ): Promise<ApiResponse<{ user: User }>> => {
      try {
        const url = getApiUrl("users", userId);
        return await ApiClient.get<ApiResponse>(url);
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    searchUsers: async (params: any): Promise<ApiResponse<UsersResponse>> => {
      try {
        const url = getApiUrl("users", "search");
        return await ApiClient.get<ApiResponse<UsersResponse>>(url, params);
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    updateProfile: async (userId: string, data: any): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("profile", userId);
        return await ApiClient.put<ApiResponse>(url, data);
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  };

  static posts = {
    // FIX: Agregado try/catch que faltaba para evitar crasheos en Dashboard
    getPosts: async (params?: any): Promise<ApiResponse<{ posts: Post[] }>> => {
      try {
        const url = getApiUrl("posts", "");
        return await ApiClient.get<ApiResponse>(url, params);
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    createPost: async (data: any): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("posts", "");
        return await ApiClient.post<ApiResponse>(url, data);
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  };

  static requests = {
    createRequest: async (data: any) => {
      const url = getApiUrl("requests", "");
      return ApiClient.post<ApiResponse>(url, data);
    },
    getUserRequests: async (
      userId: string,
      type: string = "all",
    ): Promise<ApiResponse<{ requests: Request[] }>> => {
      try {
        const url = getApiUrl("requests", `user/${userId}`);
        return await ApiClient.get<ApiResponse>(url, { type });
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    getByChat: async (
      otherUserId: string,
    ): Promise<ApiResponse<{ request: any }>> => {
      try {
        const url = getApiUrl("requests", `chat/${otherUserId}`);
        return await ApiClient.get<ApiResponse>(url);
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    updateRequestStatus: async (
      requestId: string,
      status: string,
    ): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("requests", `${requestId}/status`);
        return await ApiClient.put<ApiResponse>(url, { status });
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    completeRequest: async (
      requestId: string,
      data: any,
    ): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("requests", `${requestId}/complete`);
        return await ApiClient.post<ApiResponse>(url, data);
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  };

  static chat = {
    getUserConversations: async (
      userId: string,
    ): Promise<ApiResponse<{ conversations: any[] }>> => {
      try {
        const url = getApiUrl("conversations", `users/${userId}/conversations`);
        return await ApiClient.get<ApiResponse>(url);
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    getConversationMessages: async (
      conversationId: string,
    ): Promise<ApiResponse<{ messages: any[] }>> => {
      try {
        const url = getApiUrl("chat", `rooms/${conversationId}`);
        return await ApiClient.get<ApiResponse>(url);
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    sendMessage: async (
      conversationId: string,
      data: any,
    ): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("messages", "");
        return await ApiClient.post<ApiResponse>(url, {
          ...data,
          conversationId,
        });
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  };

  static notifications = {
    getNotifications: async () => {
      try {
        const url = getApiUrl("notifications", "");
        return await ApiClient.get<ApiResponse>(url);
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  };

  static ratings = {
    submitRating: async (data: any) => {
      try {
        const url = getApiUrl("ratings", "");
        return await ApiClient.post<ApiResponse>(url, data);
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  };
}

export default ApiClient;

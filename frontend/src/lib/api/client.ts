import { getSession } from "next-auth/react";
import { getApiUrl } from "@/config/api";

export class ApiError extends Error {
  constructor(message: string, public status?: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// ==========================================
// INTERFACES - ACTUALIZADAS CON CAMPOS OPCIONALES
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
    semester?: number;
    rating?: number;
    skills?: string[];
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
  _count: {
    messages: number;
  };
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
    };
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UsersResponse {
  users: User[];
  total?: number;
  page?: number;
  limit?: number;
}

// ==========================================
// API CLIENT PRINCIPAL - CORREGIDO
// ==========================================
export class ApiClient {
  // 👇 GESTIÓN DE TOKEN Y HEADERS
  private static async fetchWithAuth(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const session: any = await getSession();
    const token = session?.accessToken || session?.user?.accessToken;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as Record<string, string>),
    };

    console.log("🚀 FETCH →", url);

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
      throw new ApiError(
        data.message || data.error || "Error en la solicitud",
        response.status,
        data
      );
    }

    return data;
  }

  // --- MÉTODOS GENÉRICOS MEJORADOS ---
  static async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    // Filtrar parámetros undefined, null, "undefined", "null", o vacíos
    const cleanParams = params
      ? Object.entries(params).reduce((acc, [key, value]) => {
          if (value === undefined || value === null) return acc;

          const stringValue = String(value).trim();
          if (
            stringValue === "" ||
            stringValue === "undefined" ||
            stringValue === "null"
          ) {
            return acc;
          }

          acc[key] = value;
          return acc;
        }, {} as Record<string, any>)
      : undefined;

    const query =
      cleanParams && Object.keys(cleanParams).length > 0
        ? new URLSearchParams(cleanParams).toString()
        : "";

    // CORRECCIÓN: Eliminar barras duplicadas antes del query string
    const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
    const fullUrl = query ? `${cleanUrl}?${query}` : cleanUrl;

    console.log("🌐 API GET:", fullUrl);

    const response = await this.fetchWithAuth(fullUrl, { method: "GET" });
    return this.handleResponse<T>(response);
  }

  static async post<T>(url: string, body?: any): Promise<T> {
    // CORRECCIÓN: Eliminar barras duplicadas
    const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
    console.log("🌐 API POST:", cleanUrl, body);
    const response = await this.fetchWithAuth(cleanUrl, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  static async put<T>(url: string, body?: any): Promise<T> {
    const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
    console.log("🌐 API PUT:", cleanUrl, body);
    const response = await this.fetchWithAuth(cleanUrl, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  static async delete<T>(url: string): Promise<T> {
    const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
    console.log("🌐 API DELETE:", cleanUrl);
    const response = await this.fetchWithAuth(cleanUrl, { method: "DELETE" });
    return this.handleResponse<T>(response);
  }

  static async patch<T>(url: string, body?: any): Promise<T> {
    const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
    console.log("🌐 API PATCH:", cleanUrl, body);
    const response = await this.fetchWithAuth(cleanUrl, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  // ==========================================
  // SERVICIOS - CORREGIDOS
  // ==========================================

  // AUTH SERVICE
  static auth = {
    register: async (data: any): Promise<ApiResponse<{ userId: string }>> => {
      try {
        // CORRECCIÓN IMPORTANTE: Cambiamos "" por "register"
        // Esto genera "/auth/register" -> Proxy -> Backend "/register"
        const url = getApiUrl("auth", "register");

        const response = await ApiClient.post<ApiResponse>(url, data);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    login: async (credentials: any): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("auth", "login");
        const response = await ApiClient.post<ApiResponse>(url, credentials);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    logout: async (): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("auth", "logout");
        const response = await ApiClient.post<ApiResponse>(url);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  };
  // USERS SERVICE
  static users = {
    getUserProfile: async (
      userId: string
    ): Promise<ApiResponse<{ user: User }>> => {
      try {
        const url = getApiUrl("users", userId);
        const response = await ApiClient.get<ApiResponse>(url);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    createProfile: async (data: any): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("profile", "");
        const response = await ApiClient.post<ApiResponse>(url, data);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    updateProfile: async (userId: string, data: any): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("profile", userId);
        const response = await ApiClient.put<ApiResponse>(url, data);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    searchUsers: async (params: any): Promise<ApiResponse<UsersResponse>> => {
      try {
        const url = getApiUrl("users", "search");
        const response = await ApiClient.get<ApiResponse<UsersResponse>>(
          url,
          params
        );
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    getUsersByCareer: async (
      career: string,
      page = 1,
      limit = 20
    ): Promise<ApiResponse<UsersResponse>> => {
      try {
        const url = getApiUrl("users", `career/${career}`);
        const response = await ApiClient.get<ApiResponse<UsersResponse>>(url, {
          page,
          limit,
        });
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  };

  // POSTS SERVICE - CORREGIDO
  static posts = {
    createPost: async (data: any): Promise<ApiResponse<{ postId: string }>> => {
      try {
        // CORRECCIÓN: Usar path vacío en lugar de "/"
        const url = getApiUrl("posts", "");
        const response = await ApiClient.post<ApiResponse>(url, data);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    getPosts: async (params?: {
      careerSpace?: string;
      type?: string;
      page?: number;
      limit?: number;
      [key: string]: any;
    }): Promise<ApiResponse<PostsResponse>> => {
      try {
        // CORRECCIÓN PRINCIPAL: Usar path vacío, no "/"
        const url = getApiUrl("posts", "");
        console.log("📡 URL para getPosts:", url);

        // Parámetros por defecto
        const defaultParams = {
          page: 1,
          limit: 20,
          ...params,
        };

        // Filtrar valores específicos que no queremos enviar
        const cleanParams: Record<string, any> = {
          page: defaultParams.page,
          limit: defaultParams.limit,
        };

        // Solo agregar careerSpace si tiene un valor válido
        if (
          defaultParams.careerSpace &&
          defaultParams.careerSpace !== "undefined" &&
          defaultParams.careerSpace !== "null" &&
          defaultParams.careerSpace.trim() !== "" &&
          defaultParams.careerSpace !== "Todos los espacios"
        ) {
          cleanParams.careerSpace = defaultParams.careerSpace;
        }

        // Solo agregar type si tiene un valor válido
        if (
          defaultParams.type &&
          defaultParams.type !== "undefined" &&
          defaultParams.type !== "null" &&
          defaultParams.type.trim() !== "" &&
          defaultParams.type !== "all"
        ) {
          cleanParams.type = defaultParams.type;
        }

        console.log("📡 Fetching posts with params:", cleanParams);

        const response = await ApiClient.get<ApiResponse<PostsResponse>>(
          url,
          cleanParams
        );
        return response;
      } catch (error: any) {
        console.error("❌ Error in getPosts:", error);
        return {
          success: false,
          error: error.message || "Error fetching posts",
        };
      }
    },

    getPostById: async (
      postId: string
    ): Promise<ApiResponse<{ post: Post }>> => {
      try {
        const url = getApiUrl("posts", postId);
        const response = await ApiClient.get<ApiResponse>(url);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    updatePost: async (postId: string, data: any): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("posts", postId);
        const response = await ApiClient.put<ApiResponse>(url, data);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    deletePost: async (postId: string): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("posts", postId);
        const response = await ApiClient.delete<ApiResponse>(url);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  };

  // REQUESTS SERVICE - CORREGIDO
  static requests = {
    createRequest: async (
      data: any
    ): Promise<ApiResponse<{ requestId: string }>> => {
      try {
        const url = getApiUrl("requests", "");
        const response = await ApiClient.post<ApiResponse>(url, data);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    getUserRequests: async (
      userId: string,
      type: "all" | "received" | "sent" = "all"
    ): Promise<ApiResponse<{ requests: Request[] }>> => {
      try {
        const url = getApiUrl("requests", `user/${userId}`);
        const response = await ApiClient.get<ApiResponse>(url, { type });
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    updateRequestStatus: async (
      requestId: string,
      status: string,
      userId?: string
    ): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("requests", `${requestId}/status`);
        const session: any = await getSession();
        const userIdToUse = userId || session?.user?.id;
        const response = await ApiClient.put<ApiResponse>(url, {
          status,
          userId: userIdToUse,
        });
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    completeRequest: async (
      requestId: string,
      data: any
    ): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("requests", `${requestId}/complete`);
        const response = await ApiClient.post<ApiResponse>(url, data);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    getByChat: async (
      otherUserId: string
    ): Promise<ApiResponse<{ request: any }>> => {
      try {
        const session: any = await getSession();
        const currentUserId = session?.user?.id;
        if (!currentUserId) {
          return { success: false, error: "Usuario no autenticado" };
        }
        const url = getApiUrl("requests", `chat/${otherUserId}`);
        const response = await ApiClient.get<ApiResponse>(url, {
          currentUserId,
        });
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  };

  // CHAT & CONVERSATIONS SERVICE
  static chat = {
    getUserConversations: async (
      userId: string
    ): Promise<ApiResponse<{ conversations: any[] }>> => {
      try {
        const url = getApiUrl("conversations", `users/${userId}/conversations`);
        const response = await ApiClient.get<ApiResponse>(url);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    getConversationMessages: async (
      conversationId: string
    ): Promise<ApiResponse<{ messages: any[] }>> => {
      try {
        const url = getApiUrl("chat", `rooms/${conversationId}`);
        const response = await ApiClient.get<ApiResponse>(url);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    sendMessage: async (
      conversationId: string,
      data: any
    ): Promise<ApiResponse<{ messageId: string }>> => {
      try {
        const url = getApiUrl("messages", "");
        const response = await ApiClient.post<ApiResponse>(url, {
          ...data,
          conversationId,
        });
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  };

  // RATINGS SERVICE
  static ratings = {
    getUserRating: async (
      userId: string
    ): Promise<ApiResponse<{ rating: number; reviewCount: number }>> => {
      try {
        const url = getApiUrl("ratings", "");
        const response = await ApiClient.get<ApiResponse>(url, {
          toUser: userId,
        });
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    submitRating: async (data: any): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("ratings", "");
        const response = await ApiClient.post<ApiResponse>(url, data);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  };

  // NOTIFICATIONS SERVICE
  static notifications = {
    getUserNotifications: async (
      userId: string
    ): Promise<ApiResponse<{ notifications: any[] }>> => {
      try {
        const url = getApiUrl("notifications", "");
        const response = await ApiClient.get<ApiResponse>(url);
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    markAsRead: async (notificationId: string): Promise<ApiResponse> => {
      try {
        const url = getApiUrl("notifications", notificationId);
        const response = await ApiClient.patch<ApiResponse>(url, {
          read: true,
        });
        return response;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  };
}

export default ApiClient;

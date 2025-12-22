import { getSession } from "next-auth/react"; // 👈 IMPORTANTE: Importamos esto
import { API_ENDPOINTS } from "./config";

export class ApiError extends Error {
  constructor(message: string, public status?: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// Interfaces para TypeScript
export interface User {
  id: string;
  name: string;
  email: string;
  career: string;
  semester: number;
  rating: number;
  reviewCount: number;
  bio?: string;
  skills: string[];
  interests: string[];
  createdAt: string;
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
    career: string;
    semester: number;
    rating: number;
    skills: string[];
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

export class ApiClient {
  // 👇 AQUÍ ESTÁ LA MAGIA DE LA AUTENTICACIÓN
  private static async fetchWithAuth(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // 1. Obtener la sesión actual
    const session: any = await getSession();
    const token = session?.accessToken; // Recuperamos el token que guardamos en auth.ts

    // 2. Construir headers con el token
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      // Si hay token, lo inyectamos como Bearer
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
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || "Error en la solicitud",
        response.status,
        data
      );
    }

    return data;
  }

  // Métodos HTTP genéricos
  static async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const query = params ? new URLSearchParams(params).toString() : "";
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

  static async delete<T>(url: string): Promise<T> {
    const response = await this.fetchWithAuth(url, { method: "DELETE" });
    return this.handleResponse<T>(response);
  }

  // ========== AUTH SERVICE ==========
  static auth = {
    register: async (data: {
      email: string;
      password: string;
      name: string;
    }): Promise<ApiResponse<{ userId: string }>> => {
      try {
        // Registro no suele requerir Auth header, pero no hace daño
        const response = await ApiClient.post<ApiResponse<{ userId: string }>>(
          `${API_ENDPOINTS.AUTH}/register`,
          data
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    login: async (credentials: {
      email: string;
      password: string;
    }): Promise<ApiResponse<{ token: string; user: any }>> => {
      try {
        const response = await ApiClient.post<
          ApiResponse<{ token: string; user: any }>
        >(`${API_ENDPOINTS.AUTH}/login`, credentials);
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    logout: async (): Promise<ApiResponse> => {
      try {
        const response = await ApiClient.post<ApiResponse>(
          `${API_ENDPOINTS.AUTH}/logout`
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },
  };

  // ========== USERS SERVICE ==========
  static users = {
    getUserProfile: async (
      userId: string
    ): Promise<ApiResponse<{ user: User }>> => {
      try {
        const response = await ApiClient.get<ApiResponse<{ user: User }>>(
          `${API_ENDPOINTS.USERS}/${userId}`
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    createProfile: async (data: {
      userId: string;
      name: string;
      email: string;
      career: string;
      semester: number;
      bio: string;
      skills: string[];
      interests: string[];
    }): Promise<ApiResponse> => {
      try {
        const response = await ApiClient.post<ApiResponse>(
          `${API_ENDPOINTS.USERS}/profile`,
          data
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    updateProfile: async (
      userId: string,
      data: {
        name?: string;
        career?: string;
        semester?: number;
        bio?: string;
        skills?: string[];
        interests?: string[];
      }
    ): Promise<ApiResponse> => {
      try {
        const response = await ApiClient.put<ApiResponse>(
          `${API_ENDPOINTS.USERS}/${userId}/profile`,
          data
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    searchUsers: async (params: {
      query?: string;
      career?: string;
      skills?: string[];
      interests?: string[];
      page?: number;
      limit?: number;
    }): Promise<ApiResponse<UsersResponse>> => {
      try {
        const response = await ApiClient.get<ApiResponse<UsersResponse>>(
          `${API_ENDPOINTS.USERS}/search`,
          params
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    getUsersByCareer: async (
      career: string,
      page: number = 1,
      limit: number = 20
    ): Promise<ApiResponse<UsersResponse>> => {
      try {
        const response = await ApiClient.get<ApiResponse<UsersResponse>>(
          `${API_ENDPOINTS.USERS}/career/${career}`,
          { page, limit }
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },
  };

  // ========== POSTS SERVICE ==========
  static posts = {
    createPost: async (data: {
      title: string;
      content: string;
      type: string;
      careerSpace: string;
      skills: string[];
      authorId: string;
    }): Promise<ApiResponse<{ postId: string }>> => {
      try {
        const response = await ApiClient.post<ApiResponse<{ postId: string }>>(
          `${API_ENDPOINTS.POSTS}`,
          data
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    getPosts: async (params: {
      careerSpace?: string;
      type?: string;
      authorId?: string;
      page?: number;
      limit?: number;
    }): Promise<ApiResponse<PostsResponse>> => {
      try {
        const response = await ApiClient.get<ApiResponse<PostsResponse>>(
          `${API_ENDPOINTS.POSTS}`,
          params
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    getPostById: async (
      postId: string
    ): Promise<ApiResponse<{ post: Post }>> => {
      try {
        const response = await ApiClient.get<ApiResponse<{ post: Post }>>(
          `${API_ENDPOINTS.POSTS}/${postId}`
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    updatePost: async (
      postId: string,
      data: {
        title?: string;
        content?: string;
        type?: string;
        careerSpace?: string;
        skills?: string[];
      }
    ): Promise<ApiResponse> => {
      try {
        const response = await ApiClient.put<ApiResponse>(
          `${API_ENDPOINTS.POSTS}/${postId}`,
          data
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    deletePost: async (postId: string): Promise<ApiResponse> => {
      try {
        const response = await ApiClient.delete<ApiResponse>(
          `${API_ENDPOINTS.POSTS}/${postId}`
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },
  };

  // ========== REQUESTS SERVICE ==========
  static requests = {
    createRequest: async (data: {
      type: string;
      message: string;
      fromUserId: string;
      toUserId: string;
    }): Promise<ApiResponse<{ requestId: string }>> => {
      try {
        const response = await ApiClient.post<
          ApiResponse<{ requestId: string }>
        >(`${API_ENDPOINTS.REQUESTS}`, data);
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    getUserRequests: async (
      userId: string,
      type: "all" | "received" | "sent" = "all"
    ): Promise<ApiResponse<{ requests: Request[] }>> => {
      try {
        const response = await ApiClient.get<
          ApiResponse<{ requests: Request[] }>
        >(`${API_ENDPOINTS.REQUESTS}/user/${userId}?type=${type}`);
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    updateRequestStatus: async (
      requestId: string,
      status: string
    ): Promise<ApiResponse> => {
      try {
        const response = await ApiClient.put<ApiResponse>(
          `${API_ENDPOINTS.REQUESTS}/${requestId}/status`,
          { status }
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    completeRequest: async (
      requestId: string,
      data: {
        rating: number;
        review?: string;
      }
    ): Promise<ApiResponse> => {
      try {
        const response = await ApiClient.post<ApiResponse>(
          `${API_ENDPOINTS.REQUESTS}/${requestId}/complete`,
          data
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },
  };

  // ========== CHAT SERVICE ==========
  static chat = {
    getUserConversations: async (
      userId: string
    ): Promise<ApiResponse<{ conversations: any[] }>> => {
      try {
        const response = await ApiClient.get<
          ApiResponse<{ conversations: any[] }>
        >(`${API_ENDPOINTS.CHAT}/user/${userId}/conversations`);
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    getConversationMessages: async (
      conversationId: string
    ): Promise<ApiResponse<{ messages: any[] }>> => {
      try {
        const response = await ApiClient.get<ApiResponse<{ messages: any[] }>>(
          `${API_ENDPOINTS.CHAT}/conversation/${conversationId}/messages`
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    sendMessage: async (
      conversationId: string,
      data: {
        senderId: string;
        content: string;
      }
    ): Promise<ApiResponse<{ messageId: string }>> => {
      try {
        const response = await ApiClient.post<
          ApiResponse<{ messageId: string }>
        >(
          `${API_ENDPOINTS.CHAT}/conversation/${conversationId}/messages`,
          data
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },
  };

  // ========== RATINGS SERVICE ==========
  static ratings = {
    getUserRating: async (
      userId: string
    ): Promise<ApiResponse<{ rating: number; reviewCount: number }>> => {
      try {
        const response = await ApiClient.get<
          ApiResponse<{ rating: number; reviewCount: number }>
        >(`${API_ENDPOINTS.RATINGS}/user/${userId}`);
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    submitRating: async (data: {
      fromUserId: string;
      toUserId: string;
      rating: number;
      review?: string;
      requestId?: string;
    }): Promise<ApiResponse> => {
      try {
        const response = await ApiClient.post<ApiResponse>(
          `${API_ENDPOINTS.RATINGS}`,
          data
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },
  };

  // ========== NOTIFICATIONS SERVICE ==========
  static notifications = {
    getUserNotifications: async (
      userId: string
    ): Promise<ApiResponse<{ notifications: any[] }>> => {
      try {
        const response = await ApiClient.get<
          ApiResponse<{ notifications: any[] }>
        >(`${API_ENDPOINTS.NOTIFICATIONS}/user/${userId}`);
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },

    markAsRead: async (notificationId: string): Promise<ApiResponse> => {
      try {
        const response = await ApiClient.put<ApiResponse>(
          `${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`
        );
        return response;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError ? error.message : "Error desconocido",
        };
      }
    },
  };
}

export default ApiClient;

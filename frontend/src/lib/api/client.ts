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

// --- INTERFACES ---
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
}

export interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  careerSpace: string;
  createdAt: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    career?: string;
  };
}

/** * Cambiamos el nombre de la interfaz a UserRequest para evitar conflictos
 * con la interfaz 'Request' nativa del navegador durante el build de Next.js
 */
export interface UserRequest {
  id: string;
  type: string;
  message: string;
  status: string;
  createdAt: string;
  fromUserId: string;
  toUserId: string;
  fromUser: User;
  toUser: User;
  _count?: {
    messages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

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
    return fetch(url, { ...options, headers, credentials: "include" });
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
        data,
      );
    }

    if (Array.isArray(data)) {
      return {
        success: true,
        data: { posts: data, users: data, requests: data },
      } as any;
    }
    if (data && typeof data === "object" && data.success === undefined) {
      return { success: true, data: data } as any;
    }
    return data;
  }

  static async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const cleanParams = params
      ? Object.entries(params).reduce(
          (acc, [key, value]) => {
            if (
              value !== undefined &&
              value !== null &&
              value !== "" &&
              value !== "Todos los espacios"
            )
              acc[key] = value;
            return acc;
          },
          {} as Record<string, any>,
        )
      : undefined;

    const query = cleanParams
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

  // --- SERVICIOS ---
  static auth = {
    login: (c: any) => ApiClient.post(getApiUrl("auth", "login"), c),
    register: (d: any) => ApiClient.post(getApiUrl("auth", "register"), d),
    // Reincorporado: Necesario para auth.service.ts
    logout: () => ApiClient.post(getApiUrl("auth", "logout"), {}),
  };

  static users = {
    getUserProfile: (id: string) => ApiClient.get(getApiUrl("users", id)),
    searchUsers: (p: any) => ApiClient.get(getApiUrl("users", "search"), p),
    updateProfile: (id: string, data: any) =>
      ApiClient.put(getApiUrl("users", `profile/${id}`), data),
  };

  static posts = {
    getPosts: (p?: any) => ApiClient.get(getApiUrl("posts", ""), p),
    createPost: (d: any) => ApiClient.post(getApiUrl("posts", ""), d),
  };

  static requests = {
    createRequest: async (data: any) => {
      const url = getApiUrl("requests", "");
      const payload = {
        fromUserId: data.fromUserId || data.senderId,
        toUserId: data.toUserId || data.receiverId,
        type: (data.type || "COLLABORATION").toUpperCase(),
        message: data.message,
      };
      return ApiClient.post<ApiResponse>(url, payload);
    },
    getUserRequests: (userId: string, type = "all") =>
      ApiClient.get(getApiUrl("requests", `user/${userId}`), { type }),
    getByChat: (otherUserId: string) =>
      ApiClient.get(getApiUrl("requests", `chat/${otherUserId}`)),
    updateRequestStatus: (id: string, status: string) =>
      ApiClient.put(getApiUrl("requests", `${id}/status`), { status }),
    completeRequest: (id: string, data: any) =>
      ApiClient.post(getApiUrl("requests", `${id}/complete`), data),
  };

  static chat = {
    getUserConversations: (userId: string) =>
      ApiClient.get(getApiUrl("conversations", `user/${userId}`)),
    getConversationMessages: (u1: string, u2: string) =>
      ApiClient.get(getApiUrl("messages", `history/${u1}/${u2}`)),
    sendMessage: (data: any) => ApiClient.post(getApiUrl("messages", ""), data),
  };
}
export default ApiClient;

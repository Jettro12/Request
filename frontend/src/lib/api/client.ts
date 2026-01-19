import { getSession } from "next-auth/react";
import { getApiUrl } from "@/config/api";

/* =====================================================
   ERROR HANDLING
===================================================== */
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

/* =====================================================
   INTERFACES
===================================================== */
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
  _count?: { messages: number };
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/* =====================================================
   API CLIENT
===================================================== */
export class ApiClient {
  /* -------------------------------
     FETCH WITH AUTH
  -------------------------------- */
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

  /* -------------------------------
     RESPONSE HANDLER
  -------------------------------- */
  private static async handleResponse<T>(response: Response): Promise<T> {
    let data: any;

    try {
      data = await response.json();
    } catch {
      data = { message: response.statusText };
    }

    if (!response.ok) {
      throw new ApiError(
        data?.message || data?.error || "Request failed",
        response.status,
        data,
      );
    }

    // Normalización estándar
    if (Array.isArray(data)) {
      return { success: true, data } as any;
    }

    if (data && typeof data === "object" && data.success === undefined) {
      return { success: true, data } as any;
    }

    return data;
  }

  /* -------------------------------
     HTTP METHODS
  -------------------------------- */
  static async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const cleanParams = params
      ? Object.entries(params).reduce(
          (acc, [key, value]) => {
            if (
              value !== undefined &&
              value !== null &&
              value !== "" &&
              value !== "Todos los espacios"
            ) {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, any>,
        )
      : undefined;

    const query = cleanParams
      ? `?${new URLSearchParams(cleanParams).toString()}`
      : "";

    const response = await this.fetchWithAuth(url + query, {
      method: "GET",
    });

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

  /* =====================================================
     AUTH (auth-service → /api/auth-custom)
  ===================================================== */
  static auth = {
    login: (credentials: any) =>
      ApiClient.post(getApiUrl("auth", "login"), credentials),

    register: (data: any) =>
      ApiClient.post(getApiUrl("auth", "register"), data),

    logout: () => ApiClient.post(getApiUrl("auth", "logout"), {}),
  };

  /* =====================================================
     USERS & PROFILE
  ===================================================== */
  static users = {
    getUserProfile: (id: string) => ApiClient.get(getApiUrl("users", id)),

    searchUsers: (params: any) =>
      ApiClient.get(getApiUrl("users", "search"), params),

    updateProfile: (id: string, data: any) =>
      ApiClient.patch(getApiUrl("profile", id), data),
  };

  /* =====================================================
     REQUESTS
  ===================================================== */
  static requests = {
    createRequest: (data: any) => {
      const payload = {
        fromUserId: data.fromUserId || data.senderId,
        toUserId: data.toUserId || data.receiverId,
        type: (data.type || "COLLABORATION").toUpperCase(),
        message: data.message,
      };
      return ApiClient.post(getApiUrl("requests"), payload);
    },

    getUserRequests: (userId: string, type = "all") =>
      ApiClient.get(getApiUrl("requests", `user/${userId}`), { type }),

    updateRequestStatus: (id: string, status: string) =>
      ApiClient.put(getApiUrl("requests", `${id}/status`), { status }),

    getByChat: (userId: string, otherUserId: string) =>
      ApiClient.get(getApiUrl("requests", `chat/${userId}`), { otherUserId }),

    completeRequest: (id: string, data: any) =>
      ApiClient.post(getApiUrl("requests", `${id}/complete`), data),
  };

  /* =====================================================
     CHAT & MESSAGES
  ===================================================== */
  static chat = {
    getUserConversations: (userId: string) =>
      ApiClient.get(getApiUrl("conversations", `user/${userId}`)),

    getConversationMessages: (u1: string, u2: string) => {
      if (!u1 || !u2 || u1 === "undefined" || u2 === "undefined") {
        return Promise.resolve({ success: true, data: [] } as any);
      }
      return ApiClient.get(getApiUrl("messages", `history/${u1}/${u2}`));
    },

    sendMessage: (data: any) => ApiClient.post(getApiUrl("messages"), data),
  };

  /* =====================================================
     POSTS
  ===================================================== */
  static posts = {
    getPosts: (params?: any) => ApiClient.get(getApiUrl("posts"), params),

    createPost: (data: any) => ApiClient.post(getApiUrl("posts"), data),
  };
}

export default ApiClient;

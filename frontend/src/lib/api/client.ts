

import { getSession } from 'next-auth/react';
import { getApiUrl } from '@/config/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface User {
  id: string;
  name: string;
  email?: string;
  career?: string;
  semester?: number;
  image?: string;
  coverImage?: string;
  rating?: number;
  reviewCount?: number;
  bio?: string;
  skills?: string[];
  interests?: string[];
  documents?: {
    name: string;
    url: string;
    uploadedAt: string;
  }[];
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

export interface FileData {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  type: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  metadata?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string; 
  [key: string]: any; 
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  file: FileData;
}

export interface SearchUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ApiClient {
  
  private static async fetchWithAuth(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const session: any = await getSession();
    const token = session?.accessToken || session?.user?.accessToken;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as Record<string, string>),
    };

    return fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    let data: any;

    try {
      data = await response.json();
    } catch {
      data = { message: response.statusText };
    }

    if (!response.ok) {
      throw new ApiError(
        data?.message || data?.error || 'Request failed',
        response.status,
        data,
      );
    }

    if (Array.isArray(data)) {
      return { success: true, data } as any;
    }

    if (data && typeof data === 'object' && data.success === undefined) {
      return { success: true, data } as any;
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
              value !== '' &&
              value !== 'Todos los espacios'
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
      : '';

    const response = await this.fetchWithAuth(url + query, {
      method: 'GET',
    });

    return this.handleResponse<T>(response);
  }

  static async post<T>(url: string, body?: any): Promise<T> {
    const response = await this.fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  static async put<T>(url: string, body?: any): Promise<T> {
    const response = await this.fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  static async patch<T>(url: string, body?: any): Promise<T> {
    const response = await this.fetchWithAuth(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  static async upload<T>(url: string, formData: FormData): Promise<T> {
    const session: any = await getSession();
    const token = session?.accessToken || session?.user?.accessToken;

    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('=== UPLOAD DEBUG ===');
    console.log('URL:', url);

    formData.forEach((value, key) => {
      console.log(
        `FormData[${key}]:`,
        value instanceof File
          ? `${(value as File).name} (${(value as File).size} bytes, ${(value as File).type})`
          : value,
      );
    });

    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    console.log('Full URL:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    console.log('Response status:', response.status);
    console.log(
      'Response headers:',
      Object.fromEntries(response.headers.entries()),
    );

    const responseText = await response.text();
    console.log('Response text:', responseText);

    let data: any;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      console.error('JSON parse error:', error, 'Text:', responseText);
      throw new ApiError(
        'Invalid JSON response from server',
        response.status,
        responseText,
      );
    }

    if (response.status === 201 || response.ok) {
      console.log('Upload successful:', data);
      return data as T;
    }

    console.error('Upload failed:', data);
    throw new ApiError(
      data?.message || data?.error || `Upload failed (${response.status})`,
      response.status,
      data,
    );
  }

  static async delete<T>(url: string, body?: any): Promise<T> {
    const response = await this.fetchWithAuth(url, {
      method: 'DELETE',
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  static auth = {
    login: (credentials: any) =>
      ApiClient.post(getApiUrl('auth', 'login'), credentials),

    register: (data: any) =>
      ApiClient.post(getApiUrl('auth', 'register'), data),

    logout: () => ApiClient.post(getApiUrl('auth', 'logout'), {}),
  };

  static users = {
    
    getUserProfile: (id: string): Promise<ApiResponse<User>> =>
      ApiClient.get<ApiResponse<User>>(getApiUrl('users', id)),

    searchUsers: (params?: {
      query?: string;
      career?: string;
      page?: number;
      limit?: number;
    }): Promise<ApiResponse<SearchUsersResponse>> => {
      return ApiClient.get<ApiResponse<SearchUsersResponse>>(
        getApiUrl('users', 'search'),
        params,
      );
    },

    updateProfile: (id: string, data: any) =>
  ApiClient.put(getApiUrl('users', `${id}/profile`), data),


    getUsersByCareer: (
      career: string,
      params?: {
        page?: number;
        limit?: number;
      },
    ): Promise<ApiResponse<SearchUsersResponse>> => {
      return ApiClient.get<ApiResponse<SearchUsersResponse>>(
        getApiUrl('users', `career/${career}`),
        params,
      );
    },

    createProfile: (data: any): Promise<ApiResponse<User>> =>
      ApiClient.post<ApiResponse<User>>(getApiUrl('users', 'profile'), data),
  };

  static files = {
    
    uploadFile: async (
  file: File,
  userId: string,
  type: 'avatar' | 'cover' | 'post_image' | 'post_video' | 'document',
): Promise<FileData> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  formData.append('type', type);

  console.log('📤 Preparing file upload...');
  console.log('File:', file.name, file.size, file.type);
  console.log('User ID:', userId);
  console.log('Type:', type);

  const rawResponse = await ApiClient.upload<any>(
    '/api/files/upload',
    formData,
  );

  console.log('📥 Raw response from files-service:', rawResponse);

  // Normalización REAL
  const fileData =
    rawResponse?.data?.file ??
    rawResponse?.file ??
    null;

  if (!fileData) {
    console.error('❌ No file data found in response:', rawResponse);
    throw new Error('Error subiendo archivo');
  }

  console.log('✅ File uploaded correctly:', fileData);
  return fileData;
},


    getUserFiles: (
      userId: string,
      params?: {
        type?: string;
        page?: number;
        limit?: number;
      },
    ): Promise<ApiResponse<{ files: FileData[] }>> => {
      return ApiClient.get<ApiResponse<{ files: FileData[] }>>(
        `/api/files/user/${userId}`,
        params,
      );
    },

    deleteFile: (
      fileId: string,
      userId: string,
    ): Promise<ApiResponse<void>> => {
      return ApiClient.delete<ApiResponse<void>>(`/api/files/${fileId}`, {
        userId,
      });
    },

    getFileById: (fileId: string): Promise<ApiResponse<FileData>> => {
      return ApiClient.get<ApiResponse<FileData>>(`/api/files/${fileId}`);
    },
  };

  static requests = {
    createRequest: (data: any) => {
      const payload = {
        fromUserId: data.fromUserId || data.senderId,
        toUserId: data.toUserId || data.receiverId,
        type: (data.type || 'COLLABORATION').toUpperCase(),
        message: data.message,
      };
      return ApiClient.post(getApiUrl('requests'), payload);
    },

    getUserRequests: (userId: string, type = 'all') =>
      ApiClient.get(getApiUrl('requests', `user/${userId}`), { type }),

    updateRequestStatus: (id: string, status: string, userId: string) =>
      ApiClient.put(getApiUrl('requests', `${id}/status`), {
        status,
        userId,
      }),

    getByChat: (userId: string, otherUserId: string) =>
      ApiClient.get(getApiUrl('requests', `chat/${userId}`), { otherUserId }),

    completeRequest: (id: string, data: any) =>
      ApiClient.post(getApiUrl('requests', `${id}/complete`), data),
  };

  static chat = {
    getUserConversations: (userId: string) =>
      ApiClient.get(getApiUrl('conversations', `user/${userId}`)),

    getConversationMessages: (u1: string, u2: string) => {
      if (!u1 || !u2 || u1 === 'undefined' || u2 === 'undefined') {
        return Promise.resolve({ success: true, data: [] } as any);
      }
      return ApiClient.get(getApiUrl('messages', `history/${u1}/${u2}`));
    },

    sendMessage: (data: any) =>
      ApiClient.post(getApiUrl('messages'), {
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        requestId: data.requestId,
      }),
  };

  static posts = {
    getPosts: (params?: any) => ApiClient.get(getApiUrl('posts'), params),

    createPost: (data: any) => ApiClient.post(getApiUrl('posts'), data),
  };
}

export default ApiClient;
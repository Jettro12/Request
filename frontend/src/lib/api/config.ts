// lib/api/config.ts

export const API_BASE_URL = "http://127.0.0.1";

export const API_ENDPOINTS = {
  // Infraestructura Base
  NOTIFICATIONS: `${API_BASE_URL}:4001`, // Docker: notification-service -> 4001

  // Servicios Principales
  POSTS: `${API_BASE_URL}:4002`, // Docker: posts-service -> 4002
  REQUESTS: `${API_BASE_URL}:4003`, // Docker: requests-service -> 4003
  AUTH: `${API_BASE_URL}:4004`, // Docker: auth-service -> 4004
  PROFILE: `${API_BASE_URL}:4005`, // Docker: profile-service -> 4005
  RATINGS: `${API_BASE_URL}:4006`, // Docker: ratings-service -> 4006
  USERS: `${API_BASE_URL}:4007`, // Docker: users-service -> 4007

  // Chat & Mensajería
  MESSAGES: `${API_BASE_URL}:4008`, // Docker: messages-service -> 4008
  CONVERSATIONS: `${API_BASE_URL}:4009`, // Docker: conversations-service -> 4009

  // OJO: El servicio 'chat-service' no aparece en tu docker ps.
  // Si existe, verifica si se cayó o si usa otro puerto. Asumo 4010 por patrón.
  CHAT: `${API_BASE_URL}:4010`,
} as const;

export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  BASE_PATH: "/api",
} as const;

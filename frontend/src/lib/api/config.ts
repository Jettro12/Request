// lib/api/config.ts

// ❌ BORRAMOS API_BASE_URL y API_ENDPOINTS porque ya usamos src/config/api.ts
// que maneja la lógica inteligente de Docker vs Localhost.

export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  BASE_PATH: "/api",
} as const;

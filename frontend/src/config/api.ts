// src/config/api.ts
// 🔥 Versión SIMPLE para AWS / Docker

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (() => {
    console.warn("⚠️ NEXT_PUBLIC_API_BASE_URL no definido, usando fallback");
    return "http://localhost:4000";
  })();

type Service =
  | "auth"
  | "users"
  | "posts"
  | "requests"
  | "notifications"
  | "profile"
  | "ratings"
  | "messages"
  | "conversations"
  | "chat";

export function getApiUrl(service: Service, path = "") {
  const base = BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  const url = cleanPath
    ? `${base}/${service}/${cleanPath}`
    : `${base}/${service}`;

  console.log("🌐 API URL:", url);
  return url;
}

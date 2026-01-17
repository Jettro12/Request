const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:80/api";

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
  // 1. Nos aseguramos de que la base no termine en /
  const base = BASE_URL.replace(/\/$/, "");

  // 2. Limpiamos el path de barras iniciales o finales
  const cleanPath = path.toString().replace(/^\/+|\/+$/g, "");

  // 3. Construimos la URL asegurando la estructura /api/servicio/path
  // Agregamos una lógica para evitar "undefined" en la URL
  if (cleanPath === "undefined" || cleanPath === "null") {
    return `${base}/${service}`;
  }

  const url = cleanPath
    ? `${base}/${service}/${cleanPath}`
    : `${base}/${service}`;

  // Log para debug en la consola del navegador
  console.log(`📡 [getApiUrl] Service: ${service} | Full URL: ${url}`);

  return url;
}

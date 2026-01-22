/**
 * CONFIGURACIÓN DINÁMICA DE LA API
 * Este archivo centraliza la construcción de URLs para todos los microservicios.
 */

// 1. Definición de la URL Base
// Si estamos en el cliente (navegador), usamos el origen actual (LB DNS) + /api
// Si estamos en el servidor (SSR), usamos la variable de entorno o localhost
const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:80/api"
  ).replace(/\/$/, "");
};

const BASE_URL = getBaseUrl();

// 2. Tipado de Servicios
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

/**
 * Genera una URL completa para un microservicio específico.
 * @param service El nombre del microservicio (ej. 'users', 'posts')
 * @param path El endpoint específico dentro del servicio (ej. 'login', 'search')
 * @returns URL completa: http://dns-alb.com/api/servicio/path
 */
export function getApiUrl(service: Service, path: string | number = "") {
  // Aseguramos que la base esté limpia
  const base = BASE_URL.replace(/\/$/, "");

  // Convertimos path a string y limpiamos barras sobrantes
  const cleanPath = path.toString().replace(/^\/+|\/+$/g, "");

  // Evitamos que valores nulos o "undefined" rompan la URL
  if (!cleanPath || cleanPath === "undefined" || cleanPath === "null") {
    return `${base}/${service}`;
  }

  const url = `${base}/${service}/${cleanPath}`;

  // Log de depuración en desarrollo
  if (process.env.NODE_ENV === "development") {
    console.log(`📡 [API Route]: ${url}`);
  }

  return url;
}

// 3. Exportamos también la constante por si se necesita directamente
export { BASE_URL };

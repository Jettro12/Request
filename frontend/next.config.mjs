/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // MANTENER ESTO (Vital para Docker)
  reactStrictMode: true,

  // Configuración del Proxy Inverso
  async rewrites() {
    return [
      // 1. REGLA CRÍTICA PARA ARREGLAR LOGIN
      // Cuando el frontend pide "/auth", lo mandamos a "/login" en el backend
      {
        source: "/auth",
        destination: "http://auth-service:4004/login",
      },
      // 2. REGLA PARA REGISTRO
      // Cuando el frontend pide "/register", lo mandamos a "/register"
      {
        source: "/register",
        destination: "http://auth-service:4004/register",
      },
      // 3. REGLA GENÉRICA (Por si acaso)
      {
        source: "/auth/:path*",
        destination: "http://auth-service:4004/:path*",
      },

      // --- Resto de Microservicios ---
      {
        source: "/users/:path*",
        destination: "http://users-service:4007/:path*",
      },
      {
        source: "/posts/:path*",
        destination: "http://posts-service:4002/:path*",
      },
      {
        source: "/requests/:path*",
        destination: "http://requests-service:4003/:path*",
      },
      {
        source: "/notifications/:path*",
        destination: "http://notification-service:4001/:path*",
      },
      {
        source: "/profile/:path*",
        destination: "http://profile-service:4005/:path*",
      },
      {
        source: "/ratings/:path*",
        destination: "http://ratings-service:4006/:path*",
      },
      {
        source: "/messages/:path*",
        destination: "http://messages-service:4008/:path*",
      },
      {
        source: "/conversations/:path*",
        destination: "http://conversations-service:4009/:path*",
      },
      {
        source: "/chat/:path*",
        destination: "http://chat-service:4010/:path*",
      },
    ];
  },
};

export default nextConfig;

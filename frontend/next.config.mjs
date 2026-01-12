/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,

  async rewrites() {
    return [
      // ============================================================
      // 🔐 AUTH SERVICE (Puerto 4004)
      // ============================================================
      // El frontend llama a /auth para login (por NextAuth), lo mandamos a /login
      {
        source: "/auth",
        destination: "http://auth-service:4004/login",
      },
      // El registro va directo
      {
        source: "/register",
        destination: "http://auth-service:4004/register",
      },
      // Logout y otros
      {
        source: "/auth/:path*",
        destination: "http://auth-service:4004/:path*",
      },

      // ============================================================
      // 👤 USERS SERVICE (Puerto 4007)
      // ============================================================
      // IMPORTANTE: /users/search debe ir antes que /users/:id para que no confunda "search" con un ID
      {
        source: "/users/search",
        destination: "http://users-service:4007/search",
      },
      {
        source: "/users/career/:path*",
        destination: "http://users-service:4007/career/:path*",
      },
      {
        source: "/users",
        destination: "http://users-service:4007/",
      },
      {
        source: "/users/:path*",
        destination: "http://users-service:4007/:path*",
      },

      // ============================================================
      // 📝 POSTS SERVICE (Puerto 4002)
      // ============================================================
      {
        source: "/posts",
        destination: "http://posts-service:4002/",
      },
      {
        source: "/posts/:path*",
        destination: "http://posts-service:4002/:path*",
      },

      // ============================================================
      // 🤝 REQUESTS SERVICE (Puerto 4003)
      // ============================================================
      {
        source: "/requests",
        destination: "http://requests-service:4003/",
      },
      {
        source: "/requests/:path*",
        destination: "http://requests-service:4003/:path*",
      },

      // ============================================================
      // 🔔 NOTIFICATION SERVICE (Puerto 4001)
      // ============================================================
      {
        source: "/notifications",
        destination: "http://notification-service:4001/",
      },
      {
        source: "/notifications/:path*",
        destination: "http://notification-service:4001/:path*",
      },

      // ============================================================
      // 🖼️ PROFILE SERVICE (Puerto 4005)
      // ============================================================
      // Tu servicio espera /:id en la raíz
      {
        source: "/profile",
        destination: "http://profile-service:4005/",
      },
      {
        source: "/profile/:path*",
        destination: "http://profile-service:4005/:path*",
      },

      // ============================================================
      // ⭐ RATINGS SERVICE (Puerto 4006)
      // ============================================================
      {
        source: "/ratings",
        destination: "http://ratings-service:4006/",
      },
      {
        source: "/ratings/:path*",
        destination: "http://ratings-service:4006/:path*",
      },

      // ============================================================
      // 📨 MESSAGES SERVICE (Puerto 4008)
      // ============================================================
      {
        source: "/messages",
        destination: "http://messages-service:4008/",
      },
      {
        source: "/messages/:path*",
        destination: "http://messages-service:4008/:path*",
      },

      // ============================================================
      // 💬 CONVERSATIONS SERVICE (Puerto 4009)
      // ============================================================
      {
        source: "/conversations",
        destination: "http://conversations-service:4009/",
      },
      {
        source: "/conversations/:path*",
        destination: "http://conversations-service:4009/:path*",
      },

      // ============================================================
      // ⚡ CHAT SERVICE (Puerto 4010)
      // ============================================================
      {
        source: "/chat",
        destination: "http://chat-service:4010/",
      },
      {
        source: "/chat/:path*",
        destination: "http://chat-service:4010/:path*",
      },
    ];
  },
};

export default nextConfig;
